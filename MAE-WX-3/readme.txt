本程序基于MoAspEnginer3.0版本。
直接将本文件夹内容放在网站根目录或子目录中，
根目录，回调地址填写：http://你的域名/?m=Notice
子目录，回调地址填写：http://你的域名/子目录名(路径)/?m=Notice
在AppWx/Conf/WX.asp里面配置token等各种参数；
关注微信后，发送任意文本，会返回：“已收到文本消息：{刚才你发送的文本}”

1、处理代码在AppWx/Controller/DelegateController.asp中，这里面有嘎详细的说明；
2、其他接口代码在AppWx/Controller/ServicesController.asp；
3、完美支持微信AES加解密；
4、欢迎支持MAE框架(http://m.thinkasp.cn)。