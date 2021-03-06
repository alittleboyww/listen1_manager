const fs = require("fs");
const os = require("os");
const path = require("path");
const request = require("request");
const listen1 = require("./listen1").default;


const MANAGER_ROOT = path.join(os.homedir(), "listen1_manager");
const CACHE_DIR = path.join(MANAGER_ROOT, "cached");
const EXPORT_DIR = path.join(MANAGER_ROOT, "export");
const DB_FILE = path.join(MANAGER_ROOT, "db.json");

export default (function () {
    mkdirsSync(CACHE_DIR);
    mkdirsSync(EXPORT_DIR);

    function to_cached_path(track_id) {
        return path.join(CACHE_DIR, track_id + ".mp3");
    }

    function mkdirsSync(dirname) {
        if (fs.existsSync(dirname)) return true;
        else {
            if (mkdirsSync(path.dirname(dirname))) {
                fs.mkdirSync(dirname);
                return true;
            }
        }
        return false;
    }

    function downloadFile(uri, filename) {
        return new Promise((resolve, reject) => {
            let stream = fs.createWriteStream(filename);
            request(uri).pipe(stream).on("close", () => {
                resolve();
            }).on("error", (err) => {
                reject(err);
            });

        });
    }

    // TODO: 导出不要在view处理
    function doExport() {

    }

    return {

        get_music_and_cache_by_id: function (track_id) {

            return new Promise((resolve, reject) => {

                let filepath = to_cached_path(track_id);

                console.log("get_cached_path " + filepath);
                // TODO: 嵌入APlayer支持
                if (fs.existsSync(filepath)) {
                    resolve(filepath);
                } else {
                    listen1.get_track_url(track_id).then((url) => {
                        console.log("获取url成功", url);
                        downloadFile(url, filepath).then(() => {
                            console.log(`下载完毕 ${url} -> ${filepath}`);
                            resolve(filepath);
                        });
                        // TODO:处理下载失败
                    }).catch((err) => {
                        console.log("下载失败", err);
                        reject(err);
                    });


                }
            });


        },
        is_track_cached: function (track_id) {
            return fs.existsSync(to_cached_path(track_id));
        },
        to_cached_path: to_cached_path,
        mkdirsSync: mkdirsSync,
        downloadFile: downloadFile,
        doExport: doExport,
        MANAGER_ROOT: MANAGER_ROOT,
        CACHE_DIR: CACHE_DIR,
        EXPORT_DIR: EXPORT_DIR,
        DB_FILE: DB_FILE
    };
})();
