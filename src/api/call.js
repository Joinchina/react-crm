export async function getLoginState(ctx) {
    let redirect;
    if (ctx.apiBase.startsWith("http://") || ctx.apiBase.startsWith("https://")) {
        //使用绝对地址调用API，返回的回调地址也因该是绝对地址。
        redirect = window.location.href;
    } else {
        redirect = window.location.pathname + (window.location.search || '');
    }
    return ctx.get(`/call/login?r=${encodeURIComponent(redirect)}`);
}