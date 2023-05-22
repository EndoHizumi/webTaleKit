import { choice, item, show, say, nw } from 'gyarugeJS'

startScene = () => {
    bg('background.png')
}
skip = () => {
    return 0
}
endScene = () => {
    return 0
}

startScene() {
    choice(item = [
        { event: skip, caption: 'スキップする' },
        { event: null, caption: 'スキップしない' },
    ])
    text('夏の陽気が残る９月の初旬')
    show(chara = 'touka', pose = 'pose1', face = 'sad')
    say(chara = 'touka', '先輩、別れてください')
    say(chara = 'tomoki', 'え、ごめん。今･･･なんて')
    text(wait = null, speed = '1.5', '聞き取れなかったわけじゃない。 言われた意味が分からなかった。')
    text('理解したくなかった。')
}