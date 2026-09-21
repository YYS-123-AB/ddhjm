const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'data', 'data.json');
const DATA_DIR = path.dirname(DATA_PATH);

const SCENES = [
  '朋友圈', '个性签名', '抖音/快手', '小红书', '微博',
  '作文素材', '节日祝福', '情感语录', '早安晚安', '励志'
];

const TYPES = ['short', 'paragraph', 'title', 'copy'];

const AUTHORS = [
  '佚名', '网络', '李白', '杜甫', '苏轼', '李清照', '辛弃疾',
  '泰戈尔', '鲁迅', '朱自清', '三毛', '张爱玲', '村上春树',
  '王小波', '海子', '北岛', '顾城', '余秋雨', '龙应台',
  '高晓松', '韩寒', '郭敬明', '张嘉佳', '刘同', '张皓宸'
];

const SOURCES = [
  '网络收集', '个性签名网', '抖音热评', '小红书', '微博',
  '作文素材库', '节日祝福', '情感语录', '早安语录', '晚安语录',
  '励志语录', '歌曲歌词', '名人名言', '古诗收录', '散文摘抄',
  '小说语录', '电影台词', '诗词改编'
];

const CONTENTS_BY_SCENE = {
  '朋友圈': [
    '愿你成为自己喜欢的样子，不抱怨，不将就，有自由，有光芒。',
    '生活不止眼前的苟且，还有诗和远方的田野。',
    '关于夏天的记忆，是冰镇西瓜，是傍晚的风，是少年的笑。',
    '美食和风景，可以抵抗全世界所有的悲伤和迷惘。',
    '就是这个人，打破了我孤独终老的计划。',
    '今天的我，也要元气满满地生活呀。',
    '记录生活中的小确幸，每一刻都值得被珍藏。',
    '人生如逆旅，我亦是行人。',
    '愿有前程可奔赴，亦有岁月可回首。',
    '旅行的意义，不是逃避，而是寻找更好的自己。'
  ],
  '个性签名': [
    '我与成长，至死方休。',
    '做个俗人，贪财好色，一身正气。',
    '山川异域，风月同天。',
    '落花无言，人淡如菊。',
    '浮舟沧海，立马昆仑。',
    '你若盛开，清风自来。',
    '心有猛虎，细嗅蔷薇。',
    '天生我材必有用，千金散尽还复来。',
    '知足且上进，温柔而坚定。',
    '不卑不亢，不慌不忙，生活本该这样。'
  ],
  '抖音/快手': [
    '做个俗人，贪财好色，一身正气。',
    '你拼命赚钱的样子虽然狼狈，但你靠自己的样子真的很美。',
    '后来，南山的风吹散了谷堆，北海的水淹没了墓碑。',
    '你必须很努力，才能看起来毫不费力。',
    '这世界很酷，但你要更酷。做自己的女王。',
    '别问我为什么这么努力，因为我想要的东西都很贵。',
    '你要悄悄拔尖，然后惊艳所有人。',
    '月亮不睡我不睡，我是秃头小宝贝。',
    '此视频不火，天理难容！点赞的人颜值都超高。',
    '30岁才明白，人生最大的贵人，是努力的自己。'
  ],
  '小红书': [
    '关于夏天的记忆，是冰镇西瓜，是傍晚的风，是少年的笑。',
    '3个让你颜值翻倍的小习惯，第2个90%的人都不知道！',
    '周末愉快！咖啡、书籍、阳光，还有刚刚好的好心情。',
    '夏日清爽穿搭分享，155小个子也能穿出大长腿！',
    '吃瘦不饿瘦！30天减脂餐食谱分享，好吃不重样。',
    '100㎡北欧风装修前后对比，小户型也能住出大别墅的感觉！',
    '考研上岸经验分享！二本逆袭985，这5个方法让我效率翻倍！',
    '黄皮必入！这5支口红显白又不挑人，素颜涂也好看！',
    '藏在巷子里的宝藏小店！人均50吃到扶墙出，拍照超出片。',
    '私藏书单推荐！这5本书让我摆脱迷茫，格局大开。'
  ],
  '微博': [
    '这个夏天，一定要和喜欢的人去看一次海。',
    '关于青春，我们有太多的话想说。那些年一起追过的梦。',
    '#一句话形容你的夏天# 是空调房里吃西瓜，还是和喜欢的人看晚霞？',
    '如果可以回到10年前，你最想对自己说什么？',
    '最好的爱情不是什么都匹配，而是两个人愿意为对方变得更好。',
    '今天的我依然是个咸鱼，但是是一条有梦想的咸鱼。',
    '慢慢来，谁还没有一个努力的过程。',
    '人生没有白走的路，每一步都算数。',
    '山川湖海，昼夜与爱，愿你被这世界温柔以待。',
    '愿所有的美好，都如期而至。'
  ],
  '作文素材': [
    '没有伞的孩子，必须努力奔跑。',
    '时光荏苒，岁月如梭。站在人生的十字路口，我们回望过去。',
    '如果你瞄准月亮，即使迷失，也是落在璀璨星辰之间。',
    '我们终其一生，就是要摆脱他人的期待，找到真正的自己。',
    '世界上只有一种真正的英雄主义，那就是认清生活后依然热爱它。',
    '毅力，是千里大堤一沙一石的凝聚，一点点地累积。',
    '路漫漫其修远兮，吾将上下而求索。',
    '人生如逆旅，我亦是行人。',
    '选择是一个崭新的开端，选择高耸入云的峭崖便需有坚定的信念。',
    '如果说人生是一首优美的乐曲，那么痛苦则是其中不可或缺的音符。'
  ],
  '节日祝福': [
    '新的一年，愿你：有钱花，有人爱，有所期待。',
    '元宵节快乐！愿这盏花灯，照亮你前行的路，温暖你奋斗的心。',
    '520表白必备：我喜欢你，像风走了八千里，不问归期。',
    '中秋节快乐！月圆人团圆，愿你阖家欢乐，万事如意。',
    '生日快乐！愿你每一岁都奔走在自己的热爱里。',
    '圣诞节快乐！愿圣诞的烛光带给你祥和与喜悦。',
    '新年快乐！愿你身体康健，平安顺遂，财源广进，笑口常开。',
    '情人节快乐！愿有岁月可回首，且以深情共白头。',
    '端午节安康！愿你：粽是快乐，粽是微笑，粽是喜悦，粽是好运。',
    '母亲节快乐！您陪我长大，我陪您变老。妈妈，我爱您！'
  ],
  '情感语录': [
    '你是我此生最美的遇见，也是我最遥不可及的梦。',
    '后来，南山的风吹散了谷堆，北海的水淹没了墓碑。',
    '我喜欢你，像风走了八千里，不问归期。',
    '所有的苦难与背负尽头，都是行云流水般的此世光阴。',
    '真正的送别没有长亭古道，就是在一个和平时一样的清晨。',
    '我喜欢的人很优秀，我努力的理由是配得上他。',
    '两情若是久长时，又岂在朝朝暮暮。',
    '愿我如星君如月，夜夜流光相皎洁。',
    '就是这个人，打破了我孤独终老的计划。',
    '愿有岁月可回首，且以深情共白头。'
  ],
  '早安晚安': [
    '早安！愿你的今天比昨天好，明天比今天更好。',
    '夜色温柔，愿你好梦。放下今天的烦恼，迎接明天的美好。晚安。',
    '早安，打工人！今天也要元气满满哦，搬砖使我快乐。',
    '晚安，月亮不睡我不睡，我是秃头小宝贝。',
    '生活明朗，万物可爱，人间值得，未来可期。早安！',
    '早安！今天又是被梦想叫醒的一天，加油！',
    '晚安！放下手机，盖好被子，做个好梦，明天又是新的开始。',
    '太阳每天都是新的，你也是。今天也要开心鸭！早安。',
    '愿你今晚的梦，是甜甜的草莓味。晚安。',
    '早安！愿你：有事做，有人爱，有所期待。'
  ],
  '励志': [
    '人生没有白走的路，每一步都算数。',
    '如果你瞄准月亮，即使迷失，也是落在璀璨星辰之间。',
    '没有伞的孩子，必须努力奔跑。',
    '愿你走出半生，归来仍是少年。',
    '你要悄悄拔尖，然后惊艳所有人。',
    '星光不问赶路人，时光不负有心人。',
    '你若盛开，清风自来。',
    '天生我材必有用，千金散尽还复来。',
    '以梦为马，不负韶华。',
    '生活本来就是一场恶战，最终都是要单枪匹马练就自身胆量。'
  ]
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPick(arr) {
  return arr[randomInt(0, arr.length - 1)];
}

function randomPicks(arr, count) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generateSampleData(count = 120) {
  const data = [];
  let id = 1;

  for (let i = 0; i < SCENES.length; i++) {
    const scene = SCENES[i];
    const contents = CONTENTS_BY_SCENE[scene] || [];
    const perSceneCount = Math.ceil(count / SCENES.length);

    for (let j = 0; j < perSceneCount && id <= count; j++) {
      const sceneList = [scene];
      const extraScenes = randomPicks(SCENES.filter(s => s !== scene), randomInt(0, 2));
      sceneList.push(...extraScenes);

      let content = contents[j % contents.length];
      if (j >= contents.length) {
        const baseContent = randomPick(contents);
        const suffixes = ['', '加油！', '共勉。', '愿你也能如此。', '这就是生活。'];
        content = baseContent + randomPick(suffixes);
      }

      const type = TYPES[j % TYPES.length];
      if (type === 'title') {
        content = '《' + content.replace(/[，。！？、]/g, '').slice(0, 15) + '》';
      } else if (type === 'copy' && content.length < 25) {
        content = content + ' ' + randomPick([
          '这是一段精心编写的文案，希望能够触动你的内心。',
          '喜欢的话记得点赞收藏哦，你的支持是我最大的动力！',
          '在这个快节奏的时代，愿我们都能守住内心的那份宁静。'
        ]);
      } else if (type === 'paragraph' && content.length < 30) {
        content = content + ' ' + randomPick([
          '愿你在漫长的岁月里，始终保持热爱，奔赴山海。',
          '每一个不曾起舞的日子，都是对生命的辜负。',
          '让我们一起，在各自的人生道路上闪闪发光吧。'
        ]);
      }

      const daysAgo = randomInt(0, 180);
      const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
      const baseLikes = randomInt(100, 15000);
      const wordCount = content.replace(/\s/g, '').length;

      data.push({
        id: id++,
        content: content,
        author: randomPick(AUTHORS),
        source: randomPick(SOURCES),
        scenes: sceneList,
        type: type,
        wordCount: wordCount,
        likes: baseLikes,
        createdAt: createdAt,
        gradientIndex: (id - 1) % 15,
        isHot: baseLikes > 5000
      });
    }
  }

  return data.slice(0, count);
}

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log(`✓ 创建目录: ${DATA_DIR}`);
  }
}

function saveData(data) {
  ensureDir();
  const json = JSON.stringify(data, null, 2);
  fs.writeFileSync(DATA_PATH, json, 'utf-8');
  console.log(`✓ 成功保存 ${data.length} 条数据到: ${DATA_PATH}`);
}

function fetchFromRemote(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, {
      headers: {
        'User-Agent': 'Copywriting-Station-Fetcher/1.0',
        'Accept': 'application/json'
      },
      timeout: 10000
    }, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        reject(new Error(`HTTP ${res.statusCode}`));
        res.resume();
        return;
      }
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (!Array.isArray(data)) {
            reject(new Error('响应数据不是数组格式'));
            return;
          }
          resolve(data);
        } catch (e) {
          reject(new Error('JSON解析失败: ' + e.message));
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('请求超时'));
    });

    req.on('error', reject);
  });
}

async function main() {
  console.log('========================================');
  console.log('  文案短句站 - 数据获取脚本');
  console.log('========================================\n');

  const remoteUrls = [
    'https://raw.githubusercontent.com/example/copywriting-data/main/data.json',
    'https://api.example.com/copywritings'
  ];

  let fetched = false;

  for (const url of remoteUrls) {
    try {
      console.log(`尝试从远程获取数据: ${url}`);
      const data = await fetchFromRemote(url);
      if (Array.isArray(data) && data.length >= 10) {
        console.log(`✓ 从远程获取到 ${data.length} 条数据`);
        saveData(data);
        fetched = true;
        break;
      }
    } catch (e) {
      console.log(`✗ 获取失败 (${url}): ${e.message}`);
    }
  }

  if (!fetched) {
    console.log('\n⚠ 远程获取失败，正在生成示例数据...');
    const sampleData = generateSampleData(120);

    const validated = sampleData.filter(item => {
      return (
        typeof item.id === 'number' &&
        typeof item.content === 'string' &&
        item.content.length > 0 &&
        Array.isArray(item.scenes) &&
        ['short', 'paragraph', 'title', 'copy'].includes(item.type)
      );
    });

    saveData(validated);

    const sceneStats = {};
    validated.forEach(item => {
      item.scenes.forEach(s => {
        sceneStats[s] = (sceneStats[s] || 0) + 1;
      });
    });

    console.log('\n📊 数据统计:');
    console.log(`  总条数: ${validated.length}`);
    console.log(`  场景分布:`);
    Object.entries(sceneStats)
      .sort((a, b) => b[1] - a[1])
      .forEach(([scene, count]) => {
        console.log(`    - ${scene}: ${count} 条`);
      });

    const typeStats = {};
    validated.forEach(item => {
      typeStats[item.type] = (typeStats[item.type] || 0) + 1;
    });
    console.log(`  类型分布:`);
    Object.entries(typeStats).forEach(([type, count]) => {
      const labels = { short: '短句', paragraph: '段落', title: '标题', copy: '文案' };
      console.log(`    - ${labels[type] || type}: ${count} 条`);
    });
  }

  console.log('\n========================================');
  console.log('  数据准备完成！');
  console.log('========================================');
}

main().catch(e => {
  console.error('\n❌ 脚本执行出错:', e);
  console.log('\n正在回退到生成示例数据...');
  try {
    const data = generateSampleData(120);
    saveData(data);
    console.log(`✓ 已生成 ${data.length} 条示例数据作为回退方案`);
    process.exit(0);
  } catch (err) {
    console.error('❌ 生成示例数据也失败了:', err);
    process.exit(1);
  }
});
