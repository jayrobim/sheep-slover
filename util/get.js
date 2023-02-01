import fs from 'fs'
import ax from './ax.js'
import axios from "axios";
import protobufjs from "protobufjs";
import path from "path";

let url1 = 'https://cat-match.easygame2021.com/sheep/v1/game/personal_info?t='
let url2 = 'https://cat-match.easygame2021.com/sheep/v1/game/skin/info'
let url3 = 'https://cat-match.easygame2021.com/sheep/v1/game/map_info_ex?matchType=3'
let url4 = 'https://cat-match-static.easygame2021.com/maps/'
let url5 = 'https://cat-match.easygame2021.com/sheep/v1/game/topic/game_start'
let url6 = 'https://cat-match.easygame2021.com/sheep/v1/game/topic/game_join?'
let url7 = 'https://cat-match.easygame2021.com/sheep/v1/game/topic/rank'
let url8 = 'https://cat-match.easygame2021.com/sheep/v1/game/topic/info'

let urlmap = {
    me: url1,
    skin: url2,
    match: url3,
    map: url4,
    topic: url5,
    t_join: url6,
    t_rank: url7,
    t_info: url8,
}

let argv = process.argv[2]
let url = urlmap[argv]
if (url) {
    let req
    if (argv === 'map') {
        let str = fs.readFileSync('data/match')
        let match = JSON.parse(str)
        let name = match.data.map_md5[1] + '.map'
        url = url + name
        console.log(url)
        axios.get(url,{
            responseType: "arraybuffer", // 表明返回服务器返回的数据类型
        }).then((resp) => {
            let e = new Uint8Array(resp.data);
            protobufjs.load(path.join(process.cwd(), "data", "map.proto"), (_, root) => {
                const GameMap = root.lookupType("map.GameMap");
                let mapData = GameMap.decode(e.slice(21))
                let l = {};
                for (const i in mapData.levelData) {
                    let nodeList =  mapData.levelData[i].node
                    for (let j = 0; j < nodeList.length; j++) {
                        if(!nodeList[j].type) nodeList[j].type = 0;
                        if(!nodeList[j].rolNum) nodeList[j].rolNum = 0;
                        if(!nodeList[j].rowNum) nodeList[j].rowNum = 0;
                        if(!nodeList[j].layerNum) nodeList[j].layerNum = 0;
                        if(!nodeList[j].moldType) nodeList[j].moldType = 0;
                    }
                    l[i] = nodeList;
                }
                let map =  Object.assign(Object.assign({}, mapData), {
                    levelData: l
                });
                fs.writeFileSync('./data/' + argv, JSON.stringify(map))
                console.log(JSON.stringify(map))
            });
        }).catch(e => {
            console.log(e)
        })
    } else {
        if (argv === 't_join') {
            let t = process.argv[3] || 2 //1=left, 2=right
            req = ax.post(url, {'type': parseInt(t)})
        } else {
            req = ax.get(url)
        }
        req.then((resp) => {
            console.log(resp.data)
            fs.writeFileSync('./data/' + argv, JSON.stringify(resp.data))
            console.log(new Date())
            if (argv === 'topic') {
                fs.writeFileSync('./data/match', JSON.stringify(resp.data))
                console.log('sync topic to match..')
            }
        }).catch(e => {
            console.log(e)
        })
    }
}
