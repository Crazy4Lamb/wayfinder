import { Route, Waypoint, UserPersona, GroupMember, ChatMessage } from './types';

export const INITIAL_USER_PERSONA: UserPersona = {
  name: "Alex Riverstone",
  nameZh: "亚历克斯·里弗斯通",
  title: "Urban Explorer",
  titleZh: "都市闲步探索家",
  interests: ["Food", "Nature"], // matches pre-selected screen references
  budgetLevel: "mid", // Default to mid-range ($$)
  pace: "active", // Default to active with visual slider
  stats: {
    checkins: 42,
    badges: 18,
    latestAchievement: "\"Mountain Goat\" - Peak Hiker",
    latestAchievementZh: "“山林攀登大羚羊” - 极限徒步行者"
  }
};

export const POPULAR_ROUTES: Route[] = [
  {
    id: "r1",
    name: "Amalfi Coastal Drive",
    nameZh: "阿玛菲悬崖海岸自驾线",
    category: "Ocean Side",
    categoryZh: "海滨休闲",
    description: "Navigate dramatic cliff hikes, historic coastal towns, and sparkling turquoise waters.",
    descriptionZh: "穿越险峻秀美的断崖步道、充满历史底蕴的滨海城镇和波光粼粼的蔚蓝海水。",
    distanceNum: 124,
    durationMin: 135,
    rating: 4.8,
    imageUrl: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=400&q=80",
    mapUrl: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=400&q=80",
    waypoints: [
      { id: "wp10", name: "Amalfi Port Overlook", nameZh: "阿玛菲港湾观海台", description: "Scenic view of colorful cliff houses.", descriptionZh: "欣赏悬崖峭壁下落日斑斓民居的上佳地标。", address: "Piazza Flavio Gioia", addressZh: "弗拉维奥·乔亚广场" },
      { id: "wp11", name: "Duomo di Amalfi", nameZh: "阿玛菲大教堂主教座堂", description: "9th-century Roman Catholic cathedral.", descriptionZh: "宏伟经典的9世纪拜占庭罗马天主大教堂。", address: "Piazza Duomo", addressZh: "大教堂广场" },
      { id: "wp12", name: "Ravello Gardens", nameZh: "拉维罗悬崖顶端秘密花园", description: "Terraced clifftop gardens.", descriptionZh: "依山傍海而建、拥有奢华地中海眺望角的欧式空中露台。", address: "Villa Cimbrone", addressZh: "辛波乃别墅" }
    ]
  },
  {
    id: "r2",
    name: "Kyoto Temple Trail",
    nameZh: "京都千本鸟居禅境古道",
    category: "Historical",
    categoryZh: "历史人文",
    description: "Wander through bamboo groves, vermillion shrine gates, and serene Zen rock gardens.",
    descriptionZh: "闲游绿浪起伏的岚山竹林，踏过层层朱红千本鸟居，在禅境枯山水中感受静谧。",
    distanceNum: 15,
    durationMin: 90,
    rating: 4.9,
    imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=400&q=80",
    mapUrl: "https://images.unsplash.com/photo-1542044896530-05d85be9b11a?auto=format&fit=crop&w=400&q=80",
    waypoints: [
      { id: "wp20", name: "Fushimi Inari-taisha", nameZh: "伏见稻荷大社", description: "Famous path lined with thousands of vermilion torii gates.", descriptionZh: "漫山朱红色鸟居汇成的震撼长廊隧道。", address: "Fushimi Ward, Kyoto", addressZh: "京都市伏见区" },
      { id: "wp21", name: "Arashiyama Bamboo Grove", nameZh: "岚山葱郁翠竹林", description: "Stunning forest of soaring bamboo peaks.", descriptionZh: "遮天蔽日的竹林环抱小路，空气中微带清香。", address: "Ukyo Ward, Kyoto", addressZh: "京都市右京区" }
    ]
  },
  {
    id: "r3",
    name: "Swiss Alps Discovery",
    nameZh: "瑞士阿尔卑斯高原雪山探索",
    category: "Mountain",
    categoryZh: "雪山高原",
    description: "Explore majestic mountains, pristine glacier lakes, and high-altitude mountain passes.",
    descriptionZh: "近距离感知巍峨连绵的终年雪山耸峰，捧起纯净无比的冰川高山胡泊。",
    distanceNum: 85,
    durationMin: 225,
    rating: 4.7,
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80",
    mapUrl: "https://images.unsplash.com/photo-1486916856992-e4db22c8df33?auto=format&fit=crop&w=400&q=80",
    waypoints: [
      { id: "wp30", name: "Lauterbrunnen Valley", nameZh: "劳特布龙嫩幽深瀑布谷", description: "Glacier valley flanked by 72 magnificent falls.", descriptionZh: "点缀着72条壮观飞瀑、宛如童话木屋聚集的冰川峡谷。", address: "Bernese Oberland", addressZh: "伯恩高地" },
      { id: "wp31", name: "Lake Bachalpsee Trail", nameZh: "巴achalpsee 倒影湖镜面步道", description: "Perfect mirror of snowy peaks on clear days.", descriptionZh: "晴空之下，平静如镜的湖面完美倒映雪原群峦。", address: "Grindelwald, Switzerland", addressZh: "瑞士格林德瓦" }
    ]
  }
];

export const NEARBY_GEMS: Waypoint[] = [
  {
    id: "g1",
    name: "The Glasshouse Bistro",
    nameZh: "水晶玻璃屋有机风味餐厅",
    description: "Local Cuisine • Organic",
    descriptionZh: "地道特色风味 • 臻选有机健康食材",
    distance: "0.8 miles away",
    distanceZh: "相距 0.8 英里",
    openStatus: "OPEN",
    rating: 4.6,
    imageUrl: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "g2",
    name: "Modern Art Pavilion",
    nameZh: "现代几何美学艺术艺术馆",
    description: "Museum • Landmarks",
    descriptionZh: "艺术地标艺术博物馆 • 潮流拍照胜地",
    distance: "1.2 miles away",
    distanceZh: "相距 1.2 英里",
    openStatus: "CLOSED",
    rating: 4.8,
    imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=300&q=80"
  }
];

export const MAP_RECOMMENDED_CARDS: Waypoint[] = [
  {
    id: "mc1",
    name: "Sagrada Família",
    nameZh: "巴塞罗那·圣家主教座堂",
    description: "Historical Landmark • 0.8 km away",
    descriptionZh: "高耸宏伟的历史性重磅地标建筑 • 距离 0.8 公里",
    rating: 4.9,
    imageUrl: "https://images.unsplash.com/photo-1583779457094-0cfcf3697677?auto=format&fit=crop&w=300&q=80",
    openStatus: "OPEN"
  },
  {
    id: "mc2",
    name: "Park Güell",
    nameZh: "高迪经典·奎尔色彩公园",
    description: "Public Park • 1.4 km away",
    descriptionZh: "布满艳丽琉璃与魔幻雕琢的空中公园 • 距离 1.4 公里",
    rating: 4.7,
    imageUrl: "https://images.unsplash.com/photo-1509840144505-8c46fd729090?auto=format&fit=crop&w=300&q=80",
    openStatus: "OPEN"
  },
  {
    id: "mc3",
    name: "Carrer de Blai",
    nameZh: "布莱街区地道海鲜小吃街",
    description: "Gourmet District • 2.1 km away",
    descriptionZh: "聚满了西班牙Tapas和本地水果酒的热闹小街 • 距离 2.1 公里",
    rating: 4.5,
    imageUrl: "https://images.unsplash.com/photo-1515443961218-152367856621?auto=format&fit=crop&w=300&q=80",
    openStatus: "OPEN"
  }
];

export const PLANNER_WAYPOINTS: Waypoint[] = [
  { id: "pwp1", name: "St. Mark's Basilica", nameZh: "圣马可金碧大教堂", description: "Piazza San Marco", descriptionZh: "威尼斯中心圣马可广场", address: "Venice, Italy", addressZh: "威尼斯，意大利" },
  { id: "pwp2", name: "Rialto Bridge", nameZh: "黄金大运河里亚托桥", description: "Sestiere San Polo", descriptionZh: "大运河最繁华的水墨石桥拱", address: "Venice, Italy", addressZh: "威尼斯，意大利" },
  { id: "pwp3", name: "Doges' Palace", nameZh: "威尼斯总督府巴洛克宫殿", description: "Piazza San Marco, 1", descriptionZh: "叹息桥与哥特式总督行政殿堂", address: "Venice, Italy", addressZh: "威尼斯，意大利" }
];

export const GLOBAL_RECOMMENDED_WAYPOINTS: Waypoint[] = [
  { id: "gwp1", name: "Mountain View Trail", nameZh: "松岭全景眺望峭壁登山道", description: "Nature Pass • 0.8 miles away", descriptionZh: "森林巨树步道 • 距离我 0.8 英里", address: "Northern California Cascade", addressZh: "北加州雪崩山脉瀑布区", imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=300&q=80", rating: 4.9 },
  { id: "gwp2", name: "Crystal Creek Falls", nameZh: "幽谷水晶玉带瀑布步道", description: "Forest Reserve • 1.2 miles away", descriptionZh: "溪谷水雾保护区 • 距离我 1.2 英里", address: "Lush Cascade Park", addressZh: "茂盛森林溪降公园区", imageUrl: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=300&q=80", rating: 4.7 },
  { id: "gwp3", name: "Blue Lagoon Cliffs", nameZh: "蓝海潟湖翡翠断崖角", description: "Ocean Lookout • 2.6 miles away", descriptionZh: "蔚蓝海岸眺望台 • 距离我 2.6 英里", address: "Coastal Cliff Trail", addressZh: "海岸绝壁惊涛拍岸步道", imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=300&q=80", rating: 4.8 },
  { id: "gwp4", name: "Echo Valley Resort", nameZh: "回音幽峡高山松林度假村", description: "Peak Retreat • 4.1 miles away", descriptionZh: "雪山康养圣地 • 距离我 4.1 英里", address: "High Summit Valley", addressZh: "绝美群岭落日余晖幽谷", imageUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=300&q=80", rating: 4.6 }
];

export const SAVED_ROUTES: Route[] = [
  {
    id: "sr1",
    name: "Coastal Explorer",
    nameZh: "黄金都市海岸探索路线",
    category: "Ocean Side",
    categoryZh: "都市海洋休闲",
    description: "Breath-taking driving tour of custom oceanside stops.",
    descriptionZh: "涵盖日本繁华都市浪漫、静谧古寺、全景观海的完美自驾行方案。",
    distanceNum: 124,
    durationMin: 135, // 2h 15m
    rating: 4.9,
    imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=400&q=80",
    mapUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=400&q=80",
    waypoints: [
      { id: "cwp1", name: "Minato City Garden", nameZh: "东京芝公园绿地", description: "Starting point • 10:00 AM", descriptionZh: "行程正式集结出发起点 • 上午 10:00", address: "Tokyo, Japan", addressZh: "东京，日本" },
      { id: "cwp2", name: "Tokyo Tower Plaza", nameZh: "东京铁塔大展望台", description: "Scenic Overlook • 10:25 AM", descriptionZh: "全城高空璀璨全景观景台 • 上午 10:25", address: "Tokyo, Japan", addressZh: "东京，日本" },
      { id: "cwp3", name: "Zojo-ji Temple", nameZh: "巍巍增上寺古寺大门", description: "Destination • 10:55 AM", descriptionZh: "经典合流目的地古老建筑处 • 上午 10:55", address: "Tokyo, Japan", addressZh: "东京，日本" }
    ]
  },
  {
    id: "sr2",
    name: "Alpine Adventure",
    nameZh: "绝顶阿尔卑斯攀登大冒险",
    category: "Mountain",
    categoryZh: "高原雪山徒步",
    description: "High Peak mountain passes and snow valleys explorer.",
    descriptionZh: "征服极高峰峦、冰雪垭口以及静谧松林幽谷的水磨石径徒步行程。",
    distanceNum: 85,
    durationMin: 225, // 3h 45m
    rating: 4.7,
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80",
    mapUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80",
    waypoints: []
  },
  {
    id: "sr3",
    name: "Desert Mirage",
    nameZh: "狂野撒哈拉大漠追沙落日红",
    category: "Scenic Drive",
    categoryZh: "越野荒野探索",
    description: "Golden sand dunes sunset driving experience.",
    descriptionZh: "一望无际的金黄大漠沙丘越野极限体验，在落日微醺下宿营。",
    distanceNum: 210,
    durationMin: 250, // 4h 10m
    rating: 4.8,
    imageUrl: "https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=400&q=80",
    mapUrl: "https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=400&q=80",
    waypoints: []
  }
];

export const GROUP_MEMBERS: GroupMember[] = [
  {
    id: "m_me",
    name: "Alex",
    nameZh: "亚历克斯",
    distanceLeft: "1.2 km to Summit Peak",
    distanceLeftZh: "距离峰顶集结点还有 1.2 km",
    progress: 65,
    status: "waypoint",
    waypointText: "At Waypoint 3",
    waypointTextZh: "正在 3 号途经点会合休息",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "m_sarah",
    name: "Sarah",
    nameZh: "莎拉",
    distanceLeft: "0.4 km to Summit Peak",
    distanceLeftZh: "距离峰顶集结点还有 0.4 km",
    progress: 82,
    status: "lead",
    waypointText: "In Lead",
    waypointTextZh: "步速矫健处于队伍最先锋",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "m_chen",
    name: "Chen",
    nameZh: "小陈",
    distanceLeft: "2.8 km to Summit Peak",
    distanceLeftZh: "距离峰顶集结点还有 2.8 km",
    progress: 35,
    status: "following",
    waypointText: "Following",
    waypointTextZh: "正在稳步跟上大部队中",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
  }
];

export const INITIAL_CHAT: ChatMessage[] = [
  { id: "c1", sender: "Sarah", text: "Wow, this mountain scenery is stunning! I am almost at the next summit.", textZh: "哇，这里的高原林海景色太宏伟壮观了！我快登上第二关隘了。", time: "10:14 AM", isMe: false },
  { id: "c2", sender: "Chen", text: "Nice work. I am taking some photos near the valley, catching up soon!", textZh: "厉害。我在吊桥溪谷下驻扎拍照，十分钟后快速跟上！", time: "10:15 AM", isMe: false },
  { id: "c3", sender: "Alex", text: "Agreed, the trail is wonderful. Let's gather at Waypoint 3.", textZh: "举双手赞同。我们约定好在3号增上寺山门前集合休整。", time: "10:17 AM", isMe: true }
];

export const RECENT_SEARCHES: { title: string; titleZh: string; subtitle: string; subtitleZh: string }[] = [
  { title: "Blue Lagoon Cliffs", titleZh: "冰岛翡翠潟湖悬崖峭壁", subtitle: "Visited 2 days ago • Iceland", subtitleZh: "2天前浏览过 • 冰岛" },
  { title: "Echo Valley Resort", subtitle: "Visited last week • Swiss Alps", titleZh: "瑞士云松回音峡林庄", subtitleZh: "上周浏览过 • 瑞士阿尔卑斯" }
];
