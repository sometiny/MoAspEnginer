本程序基于MoAspEnginer3.1版本。

一、部署
直接将本文件夹内容放在网站根目录或子目录中，
如果放在根目录，回调地址填写：http://你的域名/interface.asp
如果放在子目录，回调地址填写：http://你的域名/子目录名(路径)/interface.asp

二、配置
在AppWx/Conf/Config.asp里面配置token等各种参数；

三、测试
关注微信后，发送任意文本，会返回：“已收到文本消息：{刚才你发送的文本}”

控制台地址：http://你的域名/console.asp
控制台可以查看程序的异常信息，线上应用时建议将MO_DEBUG_MODE设置为FILE，防止敏感信息泄露

四、注意
1、处理代码在AppWx/Controller/DelegateController.asp中，这里面有详细说明；
2、其他接口代码在AppWx/Controller/ServicesController.asp；
3、调试信息保存在AppWx/Controller/Debugs/目录
4、完美支持微信AES加解密；
5、欢迎支持MAE框架 @ http://m.thinkasp.cn