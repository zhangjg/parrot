'use strict'
const start_p = require('./prob_start.json');
const trans_p = require('./prob_trans.json');
const emit_p  = require('./prob_emit.json');

const MIN_FLOAT = -3.14e100;
const PrevStatus = {
    'B':"ES",
    'M':"MB",
    "S":"SE",
    "E":"BM"
};

function viterbi(obs,status,start_p,trans_p,emit_p){
    var V=[{}];
    var path ={};
    for(var  y of status){
        var prob = emit_p[y][obs[0]] || MIN_FLOAT;
        V[0][y] = start_p[y]+ prob;
        path[y] = [y];
    }
    for(var t=1;t<obs.length;++t){
        V.push({});
        var newpath={};
        for( var y of status){
            var em_p = MIN_FLOAT;
            if(emit_p[y] && emit_p[y][obs[t]] ){
                em_p = emit_p[y][obs[t]];
            }
            var prob=null;
            var state = null;
            for( var y0 of PrevStatus[y]){
                var tem= V[t-1][y0] + (trans_p[y0][y]|| MIN_FLOAT) + em_p;
                if(prob == null || prob < tem){
                    prob = tem;
                    state = y0;
                }
            }
            V[t][y]=prob;
            newpath[y]=path[state].concat(y);
        }
        path = newpath;
    }
    var prob = null, state = null;
    for(var y of 'ES'){
        var tem = V[obs.length-1][y];
        if(prob == null || prob < tem){
            prob = tem;
            state = y;
        }
    }
    return [prob,path[state]];
}

function * __cut(sentence){
    var [prob,pos_list]= viterbi(sentence,'BMES',start_p,trans_p,emit_p);
    var [begin,nexti]=[0,0];
    for(var i=0;i< sentence.length;++i){
        var char = sentence[i];
        var pos = pos_list[i];
        if(pos == 'B'){
            begin = i;
        }
        else if( pos == 'E'){
            yield sentence.substring(begin,i+1);
            nexti = i+1;
        }
        else if( pos == 'S'){
            yield char;
            nexti = i +1
        }
    }
    if (nexti < sentence.length){
        yield sentence.substring(nexti);
    }
}

const re_han  = /([\u4E00-\u9FD5]+)/;
const re_skip = /(\d+\.\d+|[a-zA-Z0-9]+)/;

function* cut(sentence){
    var blocks = sentence.split(re_han);
    for(var blk of blocks){
        if(blk.match(re_han)){
            for(var word of __cut(blk)){
                yield word;
            }
        }else{
            var tmp = blk.split(re_skip);
            for (var x of tmp){
                if(x!=''){
                    yield x;
                }
            }
        }
    }
}
exports.lcut= function(sentence){
    return Array.from(cut(sentence));
}
exports.cut = cut;
