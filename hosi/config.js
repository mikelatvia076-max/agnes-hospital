const CONFIG = {
    API_URL: "https://agnes-hospital.vercel.app",
    API_BASE_URL: "https://agnes-hospital.vercel.app",
    getEndpoint: function (path) {
        const cleanPath = path.startsWith('/') ? path : '/' + path;
        return this.API_URL + cleanPath;
    }
};

window.CONFIG = CONFIG;
window.API_URL = CONFIG.API_URL;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}