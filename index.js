'use strict'
var fs = require('fs');
var path = require('path');
var log = Math.log;
const re_eng = /[a-zA-Z0-g]/u;
const re_han_default = /([\u4E00-\u9FD5a-zA-Z0-9+#&\._]+)/u;
const re_skip_default = /(\r\n|\s)/u;
const re_han_cut_all = /([\u4E00-\u9FD5]+)/u;
const re_skip_cut_all = /[^a-zA-Z0-9+#\n]/u;

class Tokenizer{
    constructor(dictionary = "dict.txt"){
        this.dictionary = path.join(__dirname,dictionary);
        this.FREQ = {};
        this.total = 0;
        this.user_wrod_tag_tab={};
        this.initialized = false;
    }

    toString(){
         return `obj Tokenizer<dictionary:"${this.dictionary}">`
    }

    static gen_pfdict(filename){
        var lfreq ={};
        var ltotal = 0;
        try{
            fs.accessSync(`${filename}.json`,fs.R_OK);
            var f = require(`${filename}.json`);
            lfreq = f.freq;
            ltotal = f.ltotal;
        }catch(e)  {
            var lines = fs.readFileSync( filename,{encode:"utf8"}
        ).toString().split("\n");
            for ( var line of lines ){
                if(line.trim() == ''){
                    continue;
                }
                let word_freq = line.split(" ");
                let word = word_freq[0];
                let freq = word_freq[1];
                freq = parseInt(freq);
                lfreq[word]= freq;
                ltotal += freq;
                for(var i=0;i<word.length;++i){
                    let wfrag = word.substring(0,i+1);
                    if( ! (wfrag in lfreq)) {
                        lfreq[wfrag] = 0;
                    }
                }
            }
            var json={ltotal:ltotal,freq:lfreq};
            fs.writeFileSync(`${filename}.json`,JSON.stringify(json));
        }
        return [lfreq,ltotal];
    }

    initialize(dictionary= "dict.txt"){
        if ( this.initialized ){
            return;
        }
        [this.FREQ,this.total] = Tokenizer.gen_pfdict(dictionary);
        this.initialized = true;
    }

    check_initialized(dictionary){
        if(dictionary === undefined){
            dictionary = this.dictionary;
        }
        if(!this.initialized){
            this.initialize(dictionary);
        }
    }

    get_DAG(sentence){
        this.check_initialized();
        var DAG={};
        const N = sentence.length;
        for(var k=0;k < N; ++k){
            var tmpList = [];
            var i = k;
            var frag = sentence[k];
            while( i < N && frag in this.FREQ){
                tmpList.push(i);//k 到 i+1 的字符, 组成一个词
                i += 1;
                frag = sentence.substring(k,i+1);
            }
            if(tmpList.length ==0 ){
                tmpList.push(k);//第k个字符是一个词
            }
            DAG[k]=tmpList;
        }
        return DAG;
    }

    /*
    ** 对DAG中词, 选取最大词频 的那个词,记录到route中
    */
    calc(sentence,DAG,route){
        var N = sentence.length;
        var logtoal = log(this.total);
        route[N]=[0,0];
        for(var idx=N-1; idx> -1; --idx){
            route[idx] = [];
            var max =null;
            for( var x  of DAG[idx]){
                var t= log( this.FREQ[sentence.substring(idx,x+1)] ||
                            1 )- logtoal+route[x+1][0];
                if(max == null || max < t){
                    max = t;
                    route[idx]=[t,x]
                }
            }
        }
    }

    * __cut_all(self,sentence){
        var dag = self.get_DAG(sentence);
        var old_j = -1;
        for(var k in dag){
            var L = dag[k];
            if(L.length == 1 && k > old_j){
                yield sentence.substring(k,L[0]+1);
                old_j = L[0]
            }else{
                for(var  j of L){
                    if(j > k){
                        yield sentence.substring(k,j+1);
                        old_j = j;
                    }
                }
            }
        }
    }

    * __cut_DAG_NO_HMM(self,sentence){
        var DAG = self.get_DAG(sentence);
        var route={};
        self.calc(sentence,DAG,route);
        var x = 0;
        const N = sentence.length;
        var buf = '';
        while( x < N){
            var y = route[x][1] +1;
            var l_word = sentence.substring(x,y);
            if( l_word.match(re_eng) && l_word.length == 1){
                //l_word is  a Leater of digita
                buf += l_word;
                x = y;
            }else {
                if(buf.trim() != ''){
                    yield buf;
                    buf='';
                }
                yield l_word;
                x=y;
            }
        }

        if(buf != ''){
            yield buf;
            buf = ''
        }
    }

    * __cut_DAG(self,sentence){
        var DAG = self.get_DAG(sentence);
        route={};
        self.cacl(sentence,DAG,route);
        var x = 0;
        var buf = '';
        const N = sentence.length;
        while( x < N){
            var y = route[x][1]+1;
            var l_word = sentence.substring(x,y);
            if(y-x == 1){
                buf += l_word;
            }else{
                if( buf != ''){
                    if(buf.length == 1){
                        yield buf;
                        buf = '';
                    }else{
                        if( self.FREQ[buf] == undefined){
                            var recognized = finalseg.cut(buf);//FIXME: 还没有实现
                            for( var t of recognized ){
                                yield t;
                            }
                        }else{
                            for(elem of buf){
                                yield elem;
                            }
                        }
                        buf ='';
                    }
                    yield l_word;
                }
            }
            x=y;
        }

        if (buf != ''){
            if( buf.length == 1){
                yield buf;
            }
            else if(self.FREQ[buf] == undefined){
                var recognized = finalseg.cut(buf);//FIXME: 还没有实现
                for(var t of recognized){
                    yield t;
                }
            }
            else{
                for(elem of buf){
                    yield elem;
                }
            }
        }
    }

    * __cut(self,sentence,cut_all=false,HMM=true){
        var re_han = null;
        var re_skip = null;
        if(cut_all){
            re_han = re_han_cut_all;
            re_skip = re_skip_cut_all;
        }else{
            re_han = re_han_default;
            re_skip = re_skip_default;
        }
        var cut_block=null;
        if(cut_all){
            cut_block = self.__cut_all;
        }else if(HMM){
            cut_block = self.__cut_DAG;
        }else{
            cut_block = self.__cut_DAG_NO_HMM;
        }
        var blocks=sentence.split(re_han);
        for(var blk of blocks){
            if (blk == ''){
                continue;
            }
            if(blk.match(re_han)){
                for(var word of cut_block(self,blk)){
                    yield word;
                }
            }
            else{
                var tmp = blk.split(re_skip);
                for(x of tem){
                    if(  x.match(re_skip)){
                        yield x
                    }
                    else if(!cut_all){
                        for(xx of x){
                            yield xx;
                        }
                    }
                    else{
                        yield x;
                    }
                }
            }
        }
    }

    cut(sentence,cut_all=false,HMM=true){
        return this.__cut(this,sentence,cut_all,HMM);
    }
}

module.exports = Tokenizer;
