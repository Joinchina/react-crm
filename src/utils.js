//设置cookie的值
export function setCookie(name, value, Hours) {
    var d = new Date();
    var offset = 8;
    var utc = d.getTime() + d.getTimezoneOffset() * 60000;
    var nd = utc + 3600000 * offset;
    var exp = new Date(nd);
    exp.setTime(exp.getTime() + Hours * 60 * 60 * 1000);
    document.cookie =
      name +
      "=" +
      escape(value) +
      ";path=/;expires=" +
      exp.toGMTString() +
      ";domain=360doc.com;";
}
//获取cookie的值
export function getCookie(name) {
    var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
    if (arr != null) return unescape(arr[2]);
    return null;
}

//到处excel
export function tableToExcel(jsonData,header){

    //列标题，逗号隔开，每一个逗号就是隔开一个单元格
    let str = `${header}\n`;
    //增加\t为了不让表格显示科学计数法或者其他格式
    for(let i = 0 ; i < jsonData.length ; i++ ){
      for(let item in jsonData[i]){
          str+=`${jsonData[i][item] + '\t'},`;
      }
      str+='\n';
    }
    //encodeURIComponent解决中文乱码
    let uri = 'data:text/csv;charset=utf-8,\ufeff' + encodeURIComponent(str);
    //通过创建a标签实现
    let link = document.createElement("a");
    link.href = uri;
    //对下载的文件命名
    link.download =  "体检科列表";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
