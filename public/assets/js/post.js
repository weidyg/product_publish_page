

if (navigator.userAgent.indexOf(".NET") > -1) {
    var svg_ie = "<svg t='1587836980741' class='icon' style='width: 2em; height: 2em; vertical-align: middle; fill: currentcolor; overflow: hidden; font-size:30px;' viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg' p-id='2422' width='32' height='32'><path d='M804.5 334c12.7-44 16.7-129.9-62.1-140.5C679 184.9 604 227.2 564.5 253.3c-13-1.8-26.6-3-41-3.1-102.7-1.3-169.4 33.6-225.9 107.5-20.8 27.2-39.3 73.3-45.1 125.6 29.2-49.6 116.3-139.1 209.9-175.9 0 0-140.5 100.4-209.4 243.7l-0.2 0.2c0.1 0.7 0.1 1.4 0.2 2.1-2.9 6.5-6 13-8.8 19.9-68.6 168.5-12.5 241.4 38.8 255 47.3 12.4 113.8-10.7 166.7-67.5 90.6 21.3 179.5-2.6 213.4-21.2 63.6-34.9 106.8-96.5 117-159.8L606.7 579.8c0 0-7.3 56.1-100.4 56.1-85.8 0-89.4-99.3-89.4-99.3l368.7 0c0 0 7-107-45.9-178.3-29.3-39.6-69.5-74.5-125.4-93.3 17.1-12.6 46.6-32.2 71.5-38.7 47.2-12.3 79.5-5 99.8 29.3 27.5 46.7-15.2 156-15.2 156S791.3 380 804.5 334zM423.6 753.4c-73 59.4-133.5 52.9-156.8 17.1-20.2-31.2-23.8-87.3-0.1-163.7 11.1 29.6 28.5 58.3 54.3 83.8C352.4 721.6 387.7 741.3 423.6 753.4zM420.9 444.9c0 0 3.7-70.4 80.2-76.8 66.8-5.5 101.3 23.6 111.6 80.2L420.9 444.9z' p-id='2423' fill='#51b72f' data-spm-anchor-id='a313x.7781069.0.i11'></path></svg>";
    var svg_thunder = "<svg t='1588218903014' class='icon' style='width: 1.5em; height: 1.5em; vertical-align: middle; fill: currentcolor; overflow: hidden; font-size: 30px;' viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg' p-id='4411' width='30' height='30'><path d='M395.765 586.57H224.032c-22.421 0-37.888-22.442-29.91-43.38L364.769 95.274a32 32 0 0 1 29.899-20.608h287.957c22.72 0 38.208 23.018 29.632 44.064l-99.36 243.882h187.05c27.51 0 42.187 32.427 24.043 53.099l-458.602 522.56c-22.294 25.408-63.627 3.392-54.976-29.28l85.354-322.421z' p-id='4412' fill='#51b72f'></path></svg>";
    var html = document.querySelector("html");
    html.innerHTML = "<div style='position:fixed;width: 100%;height: 100%;background:white;z-index:999999999999;font-size:30px;'><p style='font-family: \"Microsoft YaHei\"'>当前是兼容模式，请开启<b style='color:#51b72f'>极速模式</b><br>操作方式：点击浏览器地址栏右侧的IE符号" + svg_ie + "→选择“" + svg_thunder + "<b style='color:#51b72f;'>极速模式(推荐)</b>”</p></div>";
    html.style.overflow = "hidden";
} else if (!('Promise' in window)) {
    alert("当前浏览器版本过低！");
}

const theme = getQueryString('theme');
if (theme == 'dark') { document.body.setAttribute('arco-theme', 'dark'); }

function getQueryString(name) {
    const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    const search = window.location.search.split('?')[1] || '';
    const r = search.match(reg) || [];
    return r[2];
}

function post(url, data, converData) {
    return fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", },
        body: JSON.stringify(data),
    })
        .then(function (response) {
            // console.log("response", JSON.stringify(response));
            return response.json();
        })
        .then(function (data) {
            data = data || {};
            // console.log("data", JSON.stringify(data));
            if (data.Success) {
                if (typeof converData == 'function') {
                    return converData(data.Result);
                } else {
                    return data.Result;
                }
            } else {
                data.Error = data.Error || {};
                var error = {
                    code: data.Error.Code,
                    message: data.Error.Message,
                    details: data.Error.Details,
                }
                if (data.Result) {
                    if (typeof converData == 'function') {
                        error.result = converData(data.Result);
                    } else {
                        error.result = data.Result;
                    }
                }
                return Promise.reject(error);
            }
        })
        .catch(function (error) {
            console.log("error", error);
            error = error || {};
            if (error.message == 'Failed to fetch') {
                error.message = '请求数据失败，请检查网络！'
            }
            return Promise.reject({
                code: error.code,
                message: error.message || '请求错误!',
                details: error.details,
                result: error.result,
            });
        });
}