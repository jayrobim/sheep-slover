import fs from "fs";

let str = fs.readFileSync('data/match')
let match = JSON.parse(str)
let name = match.data.map_md5[1] + '.map'
let url = 'https://cat-match-static.easygame2021.com/maps/' + name
console.log(url)

