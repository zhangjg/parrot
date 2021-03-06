# 鹦鹉学舌(Parrot)

鹦鹉学舌: 学习[结巴分词][1], 并用 Javascript 实现之.

## 动机

不是已经有 [Nodejs 版本结巴分词][2]了嘛? 为什么自己还要再从新发明轮子呢? 的确已经有 [结巴分词][1] 的 Nodejs 版本了, 我所以还要自己实现, 第一个目的是向 [结巴分词][1] 学习分词技术, 其次, 结巴分词的 Nodejs 版本虽然能用, 但实际上不是用 Javscript 实现的, 而是使用了结巴分词的 C++ 版本, 然后做了 Nodejs 的壳而已, 本质上就是用的 Nodejs 的 C/C++ 接口来完成工作的. 对于工程来说, 这样做事最省力的, 也是效率最高的, 但是对于程序员自身的提高来说, 这样的做法, 对于理解算法背后的原理, 提高自己来说, 效果是有限的. 用 Javascript 重新实现 [结巴分词][1], 我的目标不在与是否比现在的 [Nodejs 版本结巴分词][2]更有效率(我想,最有可能的是,分词的效率上不如现在的 [Nodejs 版本结巴分词][2], 因为 Javascript 的效率, 应该不会比 C++ 的执行效率更高), 而在与自己对分词技术有更深刻的理解, 在与我个人技术水平的提高.

分词技术在中文语言分析中是基础性的技术, 无论是全文搜索, 关键词提取, 还是自动摘要,以及其他中文语义分析相关的技术, 第一步都是分词. 因此, 学习分词技术有很重要的现实意义. 此外, 在网页前端可以使用的语言, 其实就是 Javascript , 因此用纯 Javascript 实现分词, 那就意味着, 有可能直接在 Web 端实现语言分析的代码的部署. 例如, 摘要自动完成功能等. 所以, 用纯 Javascript 实现分词, 也是有现实意义的.

## 系统要求

软件|版本
----|-----
Nodejs| 6.0+

## 工作进度

工作从 2016-05-01 日开始, 直接从结巴分词的最新版本的master分支对应的commit 为 `0243d568e9421ab7d3c75f49e9adfc230810e0a3` 开始学习, 并编写代码的. 从结巴分词的 Git 日志中看来, 现在的结巴分词 master 分支应该马上就会打上 0.38 的 tag. 和上次 0.36 相比, 这次的变动还是蛮大的. 使用面向对象的方法重构了代码. 但是又保持了和原来系统的兼容.

我的工作直接就使用面向对象的方法来做, 后期可能会提供与[结巴分词][1] 0.36 之前版本兼容的处理方案. 现在的代码中用了比较多的 ES6 的语法, 比如参数默认值, 生成器等内容, 所以使用的是最新的 Nodejs 的发布版本. 低版本的的 Nodejs 可能运行不了.

+ [x] 基本分词
+ [x] 自定义词典
+ [x] 为字典添加词
+ [x] 为字典删除词
+ [x] 为词建议频率
+ [x] 基于隐式马尔科夫模型的分词
+ [ ] 更全面的测试
+ [ ] Web 环境移植

[1]:https://github.com/fxsjy/jieba  "结巴分词Python"
[2]:https://github.com/yanyiwu/nodejieba "结巴分词 Nodejs版"
