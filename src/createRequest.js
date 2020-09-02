import axios from 'axios'

export const requestGet = (api,data)=>{
    return new Promise((resolve,reject)=>{
        axios.get(api, {
            params: data,
            headers:{
                Accept:'*/*'
            },
          })
          .then( (res)=> {
            if(res.status===200 && res.data.code===0){
                //   console.log(res)
                resolve(res.data.data)
              }else{
                Promise.reject(res.data)
            }
          })
          .catch( (error)=> {
             reject(error);
          });
    })
}
export const requestPost = (api,params) => {

    return new Promise((resolve, reject) => {
      axios({
        url: api,
        method:'POST',
        data: params,
        headers:{
            Accept:'*/*'
        },
      }).then(res=>{
          if(res.status===200 ){
            //   console.log(res)
            resolve(res.data)
          }
      }).catch(error => {
          reject(error);
        });
    });
};


export function uploadFile(url,file,cb){
    return new Promise((resolve,reject)=>{
        if(file){
            var form = new FormData();
            form.append("file", file);
            var xhr = new XMLHttpRequest();
            xhr.onload = (e)=>{
                resolve(JSON.parse(e.currentTarget.response))
            }; // 添加 上传成功后的回调函数
            xhr.onerror = (e)=>{
                reject(e)
            }  ; // 添加 上传失败后的回调函数
            xhr.upload.onprogress = (e)=>{
                cb(e.loaded)
            }; // 添加 监听函数
            xhr.open("POST", url, true);
            xhr.send(form);
        }else{
            alert("请先选择文件后再上传")
        }
    })
}
export function uploadFiles(url,files,cb){
    return new Promise((resolve,reject)=>{
        if(files){
            var form = new FormData();
            files.forEach(element => {
                form.append('files',element)
            })
            var xhr = new XMLHttpRequest();
            xhr.onload = (e)=>{
                resolve(JSON.parse(e.currentTarget.response))
            }; // 添加 上传成功后的回调函数
            xhr.onerror = (e)=>{
                reject(e)
            }  ; // 添加 上传失败后的回调函数
            xhr.upload.onprogress = (e)=>{
                var percent=Math.floor(e.loaded/e.total)*100;//文件上传百分比
                console.log(percent);
                cb(percent)
            }; // 添加 监听函数
            xhr.open("POST", url, true);
            xhr.send(form);
        }else{
            alert("请先选择文件后再上传")
        }
    })
}
export function uploadFilesId(url,files,id,cb){
    return new Promise((resolve,reject)=>{
        if(files){
            var form = new FormData();

            form.append('files',files)

            form.append('insuranceOrderProductId',id)
            var xhr = new XMLHttpRequest();
            xhr.onload = (e)=>{
                resolve(JSON.parse(e.currentTarget.response))
            }; // 添加 上传成功后的回调函数
            xhr.onerror = (e)=>{
                reject(e)
            }  ; // 添加 上传失败后的回调函数
            xhr.upload.onprogress = (e)=>{
                var percent=Math.floor(e.loaded/e.total)*100;//文件上传百分比
                console.log(percent);
                cb(percent)
            }; // 添加 监听函数
            xhr.open("POST", url, true);
            xhr.send(form);
        }else{
            alert("请先选择文件后再上传")
        }
    })
}
