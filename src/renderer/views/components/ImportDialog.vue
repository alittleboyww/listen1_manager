<template>
    <div>

        <el-dialog :visible.sync="visible"
                   width="80%"
                   height="80%"
                   :close-on-click-modal="false"
                   :center="true"
                   :show-close="false">

            <span slot="title" class="el-dialog__title">
                <b>批量导入</b>
            </span>
            <el-dialog
                    width="30%"
                    title="帮助"
                    :visible.sync="helpDialogVisible"
                    append-to-body>
                <div v-if="activeTab === 'fromPlayList'">

                    <div>请输入歌单/歌手/专辑的id或者url</div>
                    <div>url示例：</div>
                    <div>http://music.163.com/#/playlist?id=xxx</div>
                    <div>https://y.qq.com/n/yqq/playsquare/xxx.html</div>
                    <div>http://www.xiami.com/album/xxx</div>

                    <div> id示例：</div>
                    <div> neplaylist_xxx / nenealbum_xxx / neartist_xxx</div>
                    <div> qqplaylist_xxx / qqnealbum_xxx / qqartist_xxx</div>
                    <div> xmplaylist_xxx / xmnealbum_xxx / xmartist_xxx</div>
                </div>
                <div v-if="activeTab === 'fromTextList'">
                    <div>请输入歌名，以行分隔</div>
                    <div>例如</div>
                    <div>歌名1</div>
                    <div>歌名2</div>
                    <div>....</div>
                    <div>歌名10086</div>
                </div>
            </el-dialog>
            <el-button type="text" @click="helpDialogVisible = true">帮助</el-button>

            <el-tabs v-model="activeTab">

                <el-tab-pane label="从歌单/歌手/专辑" name="fromPlayList">


                    <el-form @submit.native.prevent>
                        <el-form-item label="ID/URL">
                            <el-input placeholder="请输入内容" v-model="input.playlist_id_or_url"
                                      @keyup.enter.native="handleSearchPlayList(input.playlist_id_or_url)">
                                <el-button slot="append" icon="el-icon-search"
                                           @click="handleSearchPlayList(input.playlist_id_or_url)">
                                </el-button>
                            </el-input>
                        </el-form-item>
                    </el-form>


                </el-tab-pane>
                <el-tab-pane label="从文本" name="fromTextList">

                    <el-form @submit.native.prevent>
                        <el-form-item label="音乐列表">

                            <el-input
                                    type="textarea"
                                    v-model="input.text_list"
                                    :autosize="{ minRows: 8, maxRows: 1000}"
                                    placeholder="">
                            </el-input>

                        </el-form-item>
                        <el-button size="large" icon="el-icon-search" @click="handleSearchTextList">搜索
                        </el-button>

                    </el-form>
                </el-tab-pane>
            </el-tabs>
            <el-table ref="resultTable"
                      :data="temp_result"
                      v-loading="tableLoading"
                      style="width: 100%">
                <el-table-column type="selection" width="50">
                </el-table-column>
                <el-table-column type="index" width="50">
                </el-table-column>
                <el-table-column prop="source" label="来源" width="100">
                </el-table-column>
                <el-table-column prop="title" label="歌名" width="180">
                    <template slot-scope="scope">
                        <el-tooltip class="item" effect="dark" :content="scope.row.id" placement="top">
                            <el-tag size="medium">{{scope.row.title}}</el-tag>
                        </el-tooltip>
                    </template>
                </el-table-column>
                <el-table-column prop="artist" label="歌手" width="180">
                    <template slot-scope="scope">
                        <el-tooltip class="item" effect="dark" :content="scope.row.artist_id" placement="top">
                            <el-tag size="medium">{{scope.row.artist}}</el-tag>
                        </el-tooltip>
                    </template>
                </el-table-column>
                <el-table-column prop="album" label="专辑" width="300">
                    <template slot-scope="scope">
                        <el-tooltip class="item" effect="dark" :content="scope.row.album_id" placement="top">
                            <el-tag size="medium">{{scope.row.album}}</el-tag>
                        </el-tooltip>
                    </template>
                </el-table-column>

                <el-table-column fixed="right" label="操作">
                    <template slot-scope="scope">
                        <el-button type="primary" size="mini" icon="el-icon-service" @click="emitPlay(scope.row)">试听
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-button round type="primary" icon="el-icon-plus" @click="emitImported()">导入选中</el-button>
            <span slot="footer" class="dialog-footer">
            <el-button @click="emitClose">关闭窗口</el-button>
        </span>
        </el-dialog>
    </div>
</template>

<script>
    const listen1 = require("../../listen1.js").default;
    const utils = require("../../utils.js").default;

    export default {
        data: function () {
            return {
                activeTab: "fromPlayList",
                input: {
                    text_list: "",
                    playlist_id_or_url: ""
                },
                tableLoading: false,
                temp_result: [],

                helpDialogVisible: false
            };
        },
        props: ["visible"],
        methods: {
            emitImported: function () {
                console.log("imported", this.$refs.resultTable.selection);
                this.$emit("imported", this.$refs.resultTable.selection);
            },
            emitPlay: function (row) {
                this.$emit("play", row);
            },
            emitClose: function () {
                this.$emit("close");
            },

            handleSearchTextList: function () {
                console.log(this.input.text_list);
                let titles = this.input.text_list.split("\n");
                console.log(titles);
                alert("Coming Soon")
            },
            handleSearchPlayList: function (urlOrId) {
                let playlist_id = this.parserUrlToId(urlOrId);
                if (playlist_id === null) {
                    this.$message({showClose: true, message: "输入错误", type: "error"});
                    return;
                }

                console.log(playlist_id);
                listen1.get_playlist(playlist_id).then(data => {
                    console.log(data);
                    // FIXME: 歌单太长时卡顿
                    this.temp_result = data.tracks;
                }).catch(err => {
                    console.log(err);
                    alert(err);
                });
            },
            // TODO: 多种url规则匹配
            parserUrlToId: function (url) {
                String.prototype.getSubStr = function (startStr, endStr) {
                    let pos_start = this.indexOf(startStr) + startStr.length;
                    // 如果结束字符为空，则取从开始字符到结束字符的所有字符串
                    let pos_end = (endStr === "") ? this.length : this.indexOf(endStr, pos_start);
                    return this.substr(pos_start, pos_end - pos_start);
                };
                String.prototype.startWith = function (str) {
                    let reg = new RegExp("^" + str);
                    return reg.test(this);
                };

                // neplaylist_xxx / nealbum_xxx / neartist_xxx
                //     qqplaylist_xxx / qqalbum_xxx / qqartist_xxx
                //     xmplaylist_xxx / xmalbum_xxx / xmartist_xxx

                let providers = ["ne", "qq", "xm"];
                let items = ["playlist", "album", "artist"];
                for (let i = 0; i < providers.length; i++) {
                    for (let j = 0; j < items.length; j++) {
                        if (url.startsWith(providers[i] + items[j] + "_")) {
                            return url;
                        }
                    }
                }

                let id;
                // list
                // http://music.163.com/#/playlist?id=xxx
                // https://y.qq.com/n/yqq/playsquare/xxx.html#stat=y_new.index.playlist.name
                // http://www.xiami.com/collect/360902783?spm=a1z1s.3061697.6856253.5.A9ep7S

                // artist

                // album
                // http://www.xiami.com/album/xxx?spm=a1z1s.6843761.1110925389.3.ZgHIvY

                if (url.startsWith("http://music.163.com/#/playlist")) {
                    id = url.getSubStr("http://music.163.com/#/playlist?id=", "&");
                    if (id === "") id = url.getSubStr("http://music.163.com/#/playlist?id=", "");
                    if (id !== "") return "neplaylist_" + id;
                }
                if (url.startsWith("https://y.qq.com/n/yqq/playsquare/")) {
                    id = url.getSubStr("https://y.qq.com/n/yqq/playsquare/", ".html");
                    if (id !== "") return "qqplaylist_" + id;
                }
                if (url.startsWith("http://www.xiami.com/collect/")) {
                    id = url.getSubStr("http://www.xiami.com/collect/", "?spm");// 注意不带spm的情况
                    if (id === "") id = url.getSubStr("http://www.xiami.com/collect/", "");
                    if (id !== "") return "xmplaylist_" + id;
                }

                return null;

            },

        },
    }
</script>

<style scoped>

</style>
