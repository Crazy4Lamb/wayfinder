import React, { useState, useEffect, useRef } from 'react';
import { 
  Waypoint, 
  Route, 
  UserPersona, 
  GroupMember, 
  ChatMessage 
} from './types';
import { 
  INITIAL_USER_PERSONA, 
  POPULAR_ROUTES, 
  NEARBY_GEMS, 
  MAP_RECOMMENDED_CARDS, 
  PLANNER_WAYPOINTS, 
  GLOBAL_RECOMMENDED_WAYPOINTS, 
  SAVED_ROUTES, 
  GROUP_MEMBERS, 
  INITIAL_CHAT,
  RECENT_SEARCHES
} from './data';

export default function App() {
  // Global App View Controls
  const [activeTab, setActiveTab] = useState<'home' | 'map' | 'planner' | 'profile'>('home');
  const [activeSubScreen, setActiveSubScreen] = useState<null | 'search_location' | 'route_detail' | 'group_share' | 'settings' | 'my_routes'>(null);
  
  // App Config and State
  const [isEnglish, setIsEnglish] = useState<boolean>(true);
  const [isNotifications, setIsNotifications] = useState<boolean>(true);
  
  // Profile / Persona State
  const [persona, setPersona] = useState<UserPersona>(() => {
    const saved = localStorage.getItem('wayfinder_persona');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_USER_PERSONA;
  });

  // Saved Routes State
  const [savedRoutes, setSavedRoutes] = useState<Route[]>(() => {
    const saved = localStorage.getItem('wayfinder_routes');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return SAVED_ROUTES;
  });

  // Current Planner State
  const [plannerWaypoints, setPlannerWaypoints] = useState<Waypoint[]>(PLANNER_WAYPOINTS);
  
  // Map Highlight State
  const [selectedMapWaypointIndex, setSelectedMapWaypointIndex] = useState<number>(0);
  const [mapBookmarkedIds, setMapBookmarkedIds] = useState<string[]>([]);
  
  // Custom Search & Selection in Route Setup Overlay
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tempSelectedWaypoints, setTempSelectedWaypoints] = useState<Waypoint[]>([]);
  
  // Detailed Screen & Itinerary Setup (Coastal Explorer)
  const [activeRoute, setActiveRoute] = useState<Route>(SAVED_ROUTES[0]);
  const [transportMode, setTransportMode] = useState<'walk' | 'bike' | 'transit' | 'drive'>('walk');
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [navigationStep, setNavigationStep] = useState<number>(0);

  // Group Live Share Panel
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>(GROUP_MEMBERS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT);
  const [currentChatInput, setCurrentChatInput] = useState<string>('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Toast Alert State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info' | 'error'>('success');
  
  // Custom Toast helper
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
  };
  
  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Custom Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Notifications List State
  const [showNotificationsMenu, setShowNotificationsMenu] = useState<boolean>(false);
  const [notificationsList, setNotificationsList] = useState<{en: string, zh: string}[]>([
    { en: "Sarah has reached Waypoint 2!", zh: "莎拉已成功到达第 2 号中转点！" },
    { en: "Your route 'Coastal Explorer' is ready for departure.", zh: "您的“黄金都市海岸探索路线”已规划完毕，随时可开启导航出发。" },
    { en: "New hidden gem 'The Glasshouse Bistro' is trending nearby.", zh: "附近新晋的热门小吃店“水晶玻璃屋有机风味餐厅”正在流行。" }
  ]);

  // Persists states in localStorage
  useEffect(() => {
    localStorage.setItem('wayfinder_persona', JSON.stringify(persona));
  }, [persona]);

  useEffect(() => {
    localStorage.setItem('wayfinder_routes', JSON.stringify(savedRoutes));
  }, [savedRoutes]);

  // Simulates dynamic live shifts in hikers' positions to give a "live tracking" feeling
  useEffect(() => {
    const interval = setInterval(() => {
      setGroupMembers(prev => prev.map(member => {
        if (member.id === 'm_me') return member; // Keep user static-ish
        // Slowly increase progress by small steps and update remaining distance mock
        const prevProgress = member.progress;
        const newProgress = Math.min(99, prevProgress + (Math.random() > 0.5 ? 1 : 0));
        const distanceLeftKm = Math.max(0.2, 3.2 - (newProgress / 100) * 3);
        const descText = member.id === 'm_sarah' 
          ? (newProgress >= 90 ? "Arrived at Summit" : "In Lead")
          : "Following";
          
        return {
          ...member,
          progress: newProgress,
          distanceLeft: `${distanceLeftKm.toFixed(1)} km to Summit Peak`,
          waypointText: descText
        };
      }));
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Scrolls chat list to bottom of screen when entering new text
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeSubScreen]);

  // Translation helpers
  const t = (en: string, zh: string) => (isEnglish ? en : zh);

  // Toggle interest tags
  const handleToggleInterest = (interest: string) => {
    setPersona(prev => {
      const interests = prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest];
      // Sync a dynamic persona role badge based on selected interests
      let title = prev.title;
      if (interests.includes('Nature') && interests.includes('Food')) title = t("Adventure Explorer", "探索家美食家");
      else if (interests.includes('Nature')) title = t("Mountain Tracker", "山野追寻者");
      else if (interests.includes('Food')) title = t("Gourmet Connoisseur", "美食寻味家");
      else if (interests.includes('History') || interests.includes('Art')) title = t("Cultural Historian", "文化学者");
      else title = t("Urban Wanderer", "都市闲逛者");

      return { ...prev, interests, title };
    });
  };

  // Toggle map bookmark state
  const handleToggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setMapBookmarkedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Switch transport maps mode and multiply mock itinerary walking times
  const getItineraryTimes = (baseMinutes: number, mode: string) => {
    switch (mode) {
      case 'bike': return Math.ceil(baseMinutes * 0.3);
      case 'drive': return Math.ceil(baseMinutes * 0.15);
      case 'transit': return Math.ceil(baseMinutes * 0.5);
      case 'walk':
      default: return baseMinutes;
    }
  };

  // Save new custom route planned in "Planner" screen
  const handleSavePlannerRoute = () => {
    if (plannerWaypoints.length === 0) {
      showToast(t("Please add at least 1 destination waypoint first!", "请先添加至少一个目的地途经点！"), "error");
      return;
    }
    const newRouteId = `custom_${Date.now()}`;
    const newRoute: Route = {
      id: newRouteId,
      name: "My New Custom Route",
      nameZh: "我的专属定制路线",
      category: "Custom Adventure",
      categoryZh: "定制探索",
      description: "Perfect trip connecting custom bookmarks.",
      descriptionZh: "自定义景点串联起来的精彩旅程。",
      distanceNum: parseFloat((plannerWaypoints.length * 4.2).toFixed(1)),
      durationMin: plannerWaypoints.length * 15,
      rating: 5.0,
      imageUrl: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=400&q=80",
      mapUrl: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=400&q=80",
      waypoints: plannerWaypoints
    };
    
    setSavedRoutes(prev => [newRoute, ...prev]);
    setActiveRoute(newRoute);
    setActiveSubScreen('my_routes');
    showToast(t("Success! Route saved into Waypoints manager.", "成功！路线已保存到您的定制路线库。"), "success");
  };

  // Chat message submit
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentChatInput.trim()) return;
    
    const newMsg: ChatMessage = {
      id: `chat_${Date.now()}`,
      sender: "Alex",
      text: currentChatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };
    
    setChatMessages(prev => [...prev, newMsg]);
    setCurrentChatInput('');
    
    // Simulate automated friendly responses from teammates after 1.5 seconds!
    setTimeout(() => {
      const responseMessages = [
        t("Awesome, on my way!", "太棒了，我这就过去！"),
        t("Nice, I see it on the group map.", "不错，我在群组地图上看到你的路线了。"),
        t("Superb, let's grab some coffee there.", "好极了，我们在那里买杯咖啡！"),
        t("I'm running slightly behind, but keep syncing!", "我稍微慢了一点，你们先玩，保持同步！")
      ];
      const randomResponse = responseMessages[Math.floor(Math.random() * responseMessages.length)];
      setChatMessages(prev => [...prev, {
        id: `chat_reply_${Date.now()}`,
        sender: Math.random() > 0.5 ? "Sarah" : "Chen",
        text: randomResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false
      }]);
    }, 1500);
  };

  // Reorder waypoints up / down interactively
  const handleMoveWaypoint = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === plannerWaypoints.length - 1) return;
    
    const newItems = [...plannerWaypoints];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;
    setPlannerWaypoints(newItems);
  };

  // Delete waypoint helper
  const handleDeleteWaypoint = (id: string) => {
    setPlannerWaypoints(prev => prev.filter(w => w.id !== id));
  };

  // Add search results waypoint
  const handleToggleSearchWaypointSelection = (wp: Waypoint) => {
    if (tempSelectedWaypoints.find(item => item.id === wp.id)) {
      setTempSelectedWaypoints(prev => prev.filter(item => item.id !== wp.id));
    } else {
      setTempSelectedWaypoints(prev => [...prev, wp]);
    }
  };

  // Done selecting searches in the Add screen overlay
  const handleDoneSearchingAndAdding = () => {
    setPlannerWaypoints(prev => {
      // Avoid duplicate keys
      const currentIds = prev.map(w => w.id);
      const filteredNew = tempSelectedWaypoints.filter(item => !currentIds.includes(item.id));
      return [...prev, ...filteredNew];
    });
    setTempSelectedWaypoints([]);
    setActiveSubScreen(null);
    setActiveTab('planner');
  };

  // Clear search state helper
  const handleClearSearches = () => {
    setTempSelectedWaypoints([]);
    setSearchQuery('');
  };

  // Simulated start navigation walkthrough stepper
  const handleStartNavigationSim = () => {
    setIsNavigating(true);
    setNavigationStep(1);
  };

  const handleNextStepNav = () => {
    if (navigationStep < activeRoute.waypoints.length) {
      setNavigationStep(p => p + 1);
    } else {
      // Completed route walk
      setIsNavigating(false);
      setNavigationStep(0);
      showToast(t("Congratulations! You completed this exploration route.", "恭喜！您已顺利完成此条探索路线。"), "success");
    }
  };

  // Delete saved route
  const handleDeleteSavedRoute = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    showConfirm(
      t("Delete Route", "修改与删除路线"),
      t("Are you sure you want to delete this route?", "您确定要彻底从您的定制探险档案库中删除这条行车/徒步路线吗？"),
      () => {
        setSavedRoutes(prev => prev.filter(r => r.id !== id));
        showToast(t("Route deleted successfully", "路线已成功彻底删除"), "info");
      }
    );
  };

  // Filter routes based on query
  const filteredSavedRoutes = savedRoutes.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen bg-gray-50 flex flex-col font-sans select-none overflow-x-hidden md:max-w-2xl md:mx-auto md:shadow-2xl md:bg-white pb-20">
      
      {/* ================= TOP APP BAR ================= */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white shadow-xs px-5 flex items-center justify-between z-40 max-w-2xl mx-auto border-b border-gray-100">
        <div className="flex items-center gap-3">
          {/* Subscreen Back Action Button */}
          {activeSubScreen ? (
            <button 
              id="subscreen-back-btn"
              onClick={() => {
                setActiveSubScreen(null);
                setIsNavigating(false);
              }}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 active:scale-90 transition-transform text-primary font-bold cursor-pointer"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
          ) : (
            <button 
              onClick={() => setActiveSubScreen('settings')}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 active:scale-90 transition-transform text-primary font-bold cursor-pointer"
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>
          )}
          <h1 className="font-display font-extrabold text-primary text-[21px] tracking-tight hover:opacity-95 cursor-pointer" onClick={() => { setActiveTab('home'); setActiveSubScreen(null); }}>
            Wayfinder
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Notification Alert Trigger */}
          <button 
            id="notif-btn"
            onClick={() => setShowNotificationsMenu(prev => !prev)}
            className="relative w-9 h-9 flex items-center justify-center text-gray-500 rounded-full hover:bg-gray-100 active:scale-95 transition-transform cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-secondary-container rounded-full ring-2 ring-white"></span>
          </button>

          {/* Settings Subscreen Gear Target directly accessible on First App Header turn */}
          <button 
            id="settings-gear-btn"
            onClick={() => setActiveSubScreen('settings')}
            className="w-9 h-9 flex items-center justify-center text-gray-500 rounded-full hover:bg-gray-100 focus:outline-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">settings</span>
          </button>
        </div>
      </header>

      {/* ================= NOTIFICATION DROPDOWN MENU ================= */}
      {showNotificationsMenu && (
        <div className="fixed top-16 right-4 left-4 md:right-auto md:left-auto md:w-[350px] bg-white border border-gray-100 rounded-xl shadow-xl z-50 p-4 transition-all animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
            <h4 className="font-display font-semibold text-sm text-gray-800">{t("Active Notifications", "实时状态通知")}</h4>
            <button 
              onClick={() => setShowNotificationsMenu(false)}
              className="text-xs text-primary hover:underline hover:text-blue-700 cursor-pointer"
            >
              {t("Done", "关闭")}
            </button>
          </div>
          <div className="space-y-3">
            {notificationsList.map((notif, index) => (
              <div key={index} className="flex gap-2 items-start text-xs p-2.5 rounded-lg bg-blue-50/50 border border-blue-50 text-gray-700">
                <span className="material-symbols-outlined text-primary text-[16px] mt-0.5">info</span>
                <p className="flex-1 leading-relaxed">{notif}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* padding offset for the fixed top-bar */}
      <div className="h-16 w-full"></div>

      {/* ======================================================== */}
      {/* ==================== CORE TAB SCREENS ================== */}
      {/* ======================================================== */}
      {activeSubScreen === null && (
        <div id="core-tab-screen-container" className="flex-1 flex flex-col p-5">
          
          {/* ========================================== */}
          {/* ====== TAB 1: HOME (DISCOVERY HUB) ======= */}
          {/* ========================================== */}
          {activeTab === 'home' && (
            <div id="tab-home-pane" className="space-y-6 animate-in fade-in duration-300">
              
              {/* Personalized Header Badge Section */}
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{t("DISCOVER INSPIRATION", "发现探索灵感")}</p>
                  <h2 className="text-[25px] font-display font-extrabold text-gray-900 tracking-tight leading-8 mt-1">
                    {t("Personalised", "为您量身推荐")} <br/> {t("for You", "专属灵感路线")}
                  </h2>
                </div>
                <div className="bg-secondary-container text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-xs self-start shrink-0">
                  {persona.budgetLevel === 'budget' && t("BUDGET ADVENTURER", "预算探险家")}
                  {persona.budgetLevel === 'mid' && t("MID ADVENTURER", "中端探险家")}
                  {persona.budgetLevel === 'luxury' && t("LUXURY EXPLORER", "奢华探索家")}
                </div>
              </div>

              {/* Featured Destination Banner Card */}
              <div className="relative rounded-2xl overflow-hidden shadow-md group border border-gray-100">
                <div className="h-[210px] relative w-full overflow-hidden">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAiwU0XYsLghozcyANtKya5h6LzfO5j2jFk2aud86twVbrx_VHGimdItJ7ZE25qStHdtLiC1JCKHy_2BAMladzmflLk66o0ATtYLit7gIQouAts3_daxUHY2FWpxSdbZ6A83uSBz_P5Kw-P1uGhDIEkv5xJP-TvSwWB0_PMTXPXMeSbbB8CrVoYk6c7H3G20UN70zDXJmfsIBVNXdY1bRLY-G1l7pkKgiN8iHHKOn76QronlTm9rDGErwxwruHfBnY2BUvA8Shr3L1y" 
                    alt="Swiss Alps Discovery" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  
                  {/* Highlight Floating Title */}
                  <div className="absolute bottom-5 left-5 right-5">
                    <p className="text-secondary-container text-xs font-bold uppercase tracking-widest">{t("Featured Destination", "今日首选灵感推荐")}</p>
                    <h3 className="text-white text-[21px] font-display font-extrabold mt-1 tracking-tight">
                      {t("Swiss Alps Discovery", "瑞士阿尔卑斯秘境群山探索")}
                    </h3>
                  </div>
                </div>
                <div className="p-4 bg-white flex items-center justify-between text-gray-700">
                  <p className="text-xs text-gray-500 mr-4">
                    {t("Recommended based on your profile and preferred travel pace.", "根据您的个人偏好和所选的节奏，为您智能推荐的最佳行车及徒步路线。")}
                  </p>
                  <button 
                    onClick={() => {
                      const alpsRoute = POPULAR_ROUTES.find(r => r.id === 'r3') || POPULAR_ROUTES[0];
                      setActiveRoute(alpsRoute);
                      setActiveSubScreen('route_detail');
                    }}
                    className="bg-primary text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:brightness-115 active:scale-95 transition-all text-center whitespace-nowrap cursor-pointer"
                  >
                    {t("Explore", "去探索")}
                  </button>
                </div>
              </div>

              {/* Search Shortcut Bar */}
              <div 
                onClick={() => setActiveSubScreen('search_location')}
                className="w-full flex items-center justify-between p-4 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-all">search</span>
                  <span className="text-gray-500 text-sm font-medium">{t("Where to next?", "接下来想去哪儿？搜索并添加到规划")}</span>
                </div>
                <span className="material-symbols-outlined text-gray-400 text-[18px]">chevron_right</span>
              </div>

              {/* Popular Routes Horizontal Draggables block */}
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <h3 className="font-display font-extrabold text-lg text-gray-800">{t("Popular Routes", "全网最热路线")}</h3>
                  <button 
                    onClick={() => setActiveSubScreen('my_routes')}
                    className="text-primary text-xs font-bold hover:underline cursor-pointer"
                  >
                    {t("View all", "查看全部")}
                  </button>
                </div>
                
                <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar snap-x">
                  {POPULAR_ROUTES.map(route => (
                    <div 
                      key={route.id}
                      onClick={() => {
                        setActiveRoute(route);
                        setActiveSubScreen('route_detail');
                      }}
                      className="min-w-[245px] max-w-[245px] bg-white rounded-xl overflow-hidden shadow-xs hover:shadow-md border border-gray-100 active:scale-98 transition-all scroll-snap-center cursor-pointer"
                    >
                      <div className="h-[120px] relative">
                        <img src={route.imageUrl} alt={route.name} className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs text-[10px] font-bold px-2 py-0.5 rounded-full text-secondary flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          {route.rating}
                        </div>
                      </div>
                      <div className="p-3.5">
                        <span className="text-primary text-[10px] font-extrabold tracking-wider uppercase bg-blue-50 px-2 py-0.5 rounded-md">
                          {route.category}
                        </span>
                        <h4 className="font-display font-bold text-sm text-gray-900 mt-2 truncate">{route.name}</h4>
                        <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">{route.description}</p>
                        
                        <div className="flex items-center justify-between border-t border-gray-100 pt-2.5 mt-2.5 text-[11px] font-semibold text-gray-500">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">distance</span>
                            {route.distanceNum} km
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">schedule</span>
                            {route.id === 'r1' ? "5 Days" : route.id === 'r2' ? "1 Day" : "3-4 Hours"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nearby Gems Section */}
              <div>
                <h3 className="font-display font-extrabold text-lg text-gray-800 mb-3.5">
                  {t("Nearby Treasure Gems", "附近隐藏宝藏景点")}
                </h3>
                <div className="space-y-3">
                  {NEARBY_GEMS.map(gem => (
                    <div 
                      key={gem.id}
                      onClick={() => {
                        showToast(
                          isEnglish 
                            ? `Selected: ${gem.name}. Add it to your custom itinerary in Planner!` 
                            : `已选定：${gem.nameZh || gem.name}。点击底栏 [路线定制] 即可添加至此行！`, 
                          "info"
                        );
                      }}
                      className="flex bg-white rounded-xl p-3 shadow-xs border border-gray-100 hover:shadow-xs transition-shadow duration-200 cursor-pointer"
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                        <img src={gem.imageUrl} alt={gem.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="ml-3 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="font-display font-bold text-sm text-gray-800 line-clamp-1">
                              {isEnglish ? gem.name : (gem.nameZh || gem.name)}
                            </h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${gem.openStatus === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>
                              {gem.openStatus}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {isEnglish ? gem.description : (gem.descriptionZh || gem.description)}
                          </p>
                        </div>
                        <div className="flex justify-between items-center text-[11px] text-primary font-semibold mt-1">
                          <span className="flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[13px]">near_me</span>
                            {isEnglish ? gem.distance : (gem.distanceZh || gem.distance)}
                          </span>
                          <button 
                            onClick={(e) => handleToggleBookmark(gem.id, e)}
                            className="bg-transparent hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-primary text-[18px]">
                              {mapBookmarkedIds.includes(gem.id) ? 'favorite' : 'favorite_border'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Route Create Entry button */}
              <div className="pt-2">
                <button 
                  onClick={() => {
                    setPlannerWaypoints(PLANNER_WAYPOINTS);
                    setActiveTab('planner');
                  }}
                  className="w-full py-4 bg-primary text-white rounded-xl font-display font-bold shadow-md hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined">add_road</span>
                  {t("Design A Fresh Custom Journey", "立即建立我的新自定义路线")}
                </button>
              </div>

            </div>
          )}

          {/* ========================================== */}
          {/* ========== TAB 2: LIVE EXPLORE MAP ====== */}
          {/* ========================================== */}
          {activeTab === 'map' && (
            <div id="tab-map-pane" className="flex-1 flex flex-col min-h-[500px] relative animate-in fade-in duration-300">
              
              {/* Map Floating Search Overlay */}
              <div className="absolute top-2 left-2 right-2 z-30">
                <div className="glass-effect rounded-xl shadow-md p-2 flex items-center gap-3 border border-gray-150">
                  <span className="material-symbols-outlined text-gray-500 ml-2">search</span>
                  <input 
                    type="text" 
                    placeholder={t("Search hidden gems...", "输入搜索巴塞罗那/京都隐藏景点...")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none focus:outline-none w-full font-sans text-sm text-gray-800 placeholder-gray-400"
                  />
                  <button 
                    onClick={() => {
                      if (searchQuery) setSearchQuery('');
                      else setActiveSubScreen('search_location');
                    }}
                    className="bg-primary text-white p-2 rounded-lg active:scale-95 transition-transform flex items-center justify-center cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">{searchQuery ? 'close' : 'tune'}</span>
                  </button>
                </div>
              </div>

              {/* Map Canvas Background Container */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden bg-gray-200" style={{ height: 'calc(100% - 100px)' }}>
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_OrfMGr1I_gE3y52oOZ5qRpuEpS4sor-j8O2VTUXVVjq-NG84rdzBuTcWE_9JG9bbo7anJ_qkRTuJlRVRDEjyxYruNbLUOuLNR24rrUMwwS_lrLikan4AM6jqt6-8IqRtP_IhgnOZgXcF3Yud38agT9OZqYSv2C5F3gcwM6c10KzxYIK8FxzEdFY3l1kSmsmVSxIPr0e_Cd01HLkReORD9bxAQQGax-kImGAXcfBCqOEYPfa6-2pPAEKOUoln3IkZwoI7E4rDREtw" 
                  alt="City Map Background" 
                  className="w-full h-full object-cover select-none"
                />
                
                {/* SVG Route Path overlays with dash line styling */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 800">
                  {/* Active route connector path depending on bottom slider */}
                  <path 
                    className="route-path" 
                    d={
                      selectedMapWaypointIndex === 0 
                        ? "M 150,450 Q 220,400 180,300 T 280,180" 
                        : selectedMapWaypointIndex === 1
                        ? "M 150,450 Q 180,480 250,560 T 320,410"
                        : "M 150,450 Q 80,410 120,320 T 190,260"
                    } 
                    fill="none" 
                    stroke="#0050cb" 
                    strokeWidth="4" 
                    strokeLinecap="round"
                    opacity="0.85"
                  />
                  
                  {/* Interactive Position Marker with animated wave pulses */}
                  <circle cx="150" cy="450" r="10" fill="#0050cb" opacity="0.2">
                    <animate attributeName="r" from="10" to="25" dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.2" to="0" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="150" cy="450" r="6" fill="#0050cb" stroke="#ffffff" strokeWidth="2" />

                  {/* Pin Markers relative to chosen slide card */}
                  <circle cx="280" cy="180" r="9" fill="#8a5100" stroke="#ffffff" strokeWidth="2" opacity={selectedMapWaypointIndex === 0 ? 1 : 0.4} />
                  <circle cx="320" cy="410" r="9" fill="#8a5100" stroke="#ffffff" strokeWidth="2" opacity={selectedMapWaypointIndex === 1 ? 1 : 0.4} />
                  <circle cx="190" cy="260" r="9" fill="#8a5100" stroke="#ffffff" strokeWidth="2" opacity={selectedMapWaypointIndex === 2 ? 1 : 0.4} />
                </svg>

                {/* Left Floating Overlay Widget controls */}
                <div className="absolute right-3 top-20 flex flex-col gap-2">
                  <button onClick={() => showToast(t("GPS positioning established. Accuracy +/- 4m.", "GPS定位已校准。实时信号精度在 +/- 4米内。"), "success")} className="w-10 h-10 bg-white rounded-xl shadow-xs ring-1 ring-gray-100 flex items-center justify-center text-primary active:scale-90 cursor-pointer">
                    <span className="material-symbols-outlined text-[20px]">my_location</span>
                  </button>
                  <button onClick={() => showToast(t("Map layered mode changed: Standard Vector Terrain.", "地图图层已成功切换至：高分辨率标准地形图。"), "info")} className="w-10 h-10 bg-white rounded-xl shadow-xs ring-1 ring-gray-100 flex items-center justify-center text-primary active:scale-90 cursor-pointer">
                    <span className="material-symbols-outlined text-[20px]">layers</span>
                  </button>
                </div>

                {/* Floating Social Sync Entry shortcut banner */}
                <div 
                  onClick={() => setActiveSubScreen('group_share')}
                  className="absolute bottom-52 left-3 right-3 bg-secondary text-white font-semibold text-[11px] px-3 py-2 rounded-full cursor-pointer flex items-center justify-between shadow-md active:scale-98 animate-pulse"
                >
                  <span className="flex items-center gap-1.5 uppercase tracking-wide">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-ping"></span>
                    {t("Live Hiker group session sync is active!", "实时徒步小组位置共享同步中！")}
                  </span>
                  <span className="underline text-orange-200">{t("Track group", "进入小组 progress")}</span>
                </div>
              </div>

              {/* Horizontal sliding snapping selection list below mapping */}
              <div className="absolute bottom-2 left-0 right-0 z-35 overflow-hidden">
                <div className="flex gap-4 overflow-x-auto px-4 pb-4 no-scrollbar snap-x">
                  {MAP_RECOMMENDED_CARDS.map((card, idx) => {
                    const isSelected = selectedMapWaypointIndex === idx;
                    return (
                      <div 
                        key={card.id}
                        onClick={() => setSelectedMapWaypointIndex(idx)}
                        className={`min-w-[275px] max-w-[275px] bg-white rounded-xl overflow-hidden shadow-lg snap-center border-2 transition-all transition-transform cursor-pointer ${
                          isSelected ? 'border-primary scale-[1.02]' : 'border-transparent opacity-95'
                        }`}
                      >
                        <div className="h-28 relative">
                          <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover" />
                          <div className="absolute top-2 right-2 bg-orange-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                            RECOMMENDED
                          </div>
                        </div>
                        <div className="p-3.5">
                          <div className="flex justify-between items-start">
                            <h4 className="font-display font-bold text-sm text-gray-800">{card.name}</h4>
                            <span className="text-[11px] text-secondary font-bold flex items-center gap-0.5">
                              <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                              {card.rating}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-0.5">{card.description}</p>
                          
                          <div className="flex gap-2 mt-3.5">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                const popularMatch = POPULAR_ROUTES.find(r => r.id === 'r1') || POPULAR_ROUTES[0];
                                setActiveRoute(popularMatch);
                                setActiveSubScreen('route_detail');
                              }}
                              className="flex-1 bg-primary text-white py-1.5 rounded-lg text-[11px] font-bold active:scale-95 transition-transform whitespace-nowrap cursor-pointer"
                            >
                              {t("Navigate details", "智能导航与规划")}
                            </button>
                            <button 
                              onClick={(e) => handleToggleBookmark(card.id, e)}
                              className="px-2.5 border border-gray-250 text-gray-400 rounded-lg active:scale-95 transition-transform hover:text-red-500 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px] mt-0.5">
                                {mapBookmarkedIds.includes(card.id) ? 'bookmark' : 'bookmark_border'}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* ========================================== */}
          {/* ========== TAB 3: CUSTOM TRIP PLANNER ===== */}
          {/* ========================================== */}
          {activeTab === 'planner' && (
            <div id="tab-planner-pane" className="space-y-5 animate-in fade-in duration-300">
              
              <div>
                <h2 className="text-[23px] font-display font-extrabold text-gray-900 tracking-tight">{t("Build Your Trip", "画线建档 - 自定义路线")}</h2>
                <p className="text-xs text-on-surface-variant leading-relaxed mt-1">
                  {t("Design your perfect adventure by connecting the dots. Sort or add stops, and see your customized journey come to life.", "拖拽或微调序列、随时添加景点，系统会自动实时重新计算旅行耗时与距离。")}
                </p>
              </div>

              {/* Map Path Mini Preview Card */}
              <div className="relative rounded-2xl overflow-hidden shadow-xs border border-gray-150">
                <div className="h-[150px] relative w-full">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuASiM6fUy_KmyuAyua38GfzBhIQRvqS2A668ZjZj9qOZmIVWKfqXDuaq5IYVxes_gco6YWAu6xcc-P6Rsu2Q-rfMCvUBWpagKw1lOjTWJaavzMicee3tUYEGSgNhVOSGqeyXXbNAmULYbcCb_7Oq4muaKmhxPG_274uHLsFXwRASS01eVt2xGszkJ4e8tqkCIfvtogGul4MDsHK9dkkcA5k-mS9EVZ7T-phAx9i1Yfdwl0JqC-1tSQQyS-ajJqWWpqtTOre4fHvxAI5" 
                    alt="Venice Route Preview" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
                
                {/* Real-time stats calculations */}
                <div className="absolute bottom-3 left-3 right-3 flex gap-3">
                  <div className="flex-1 bg-white/90 backdrop-blur-md px-3 py-2.5 rounded-xl border border-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[18px]">schedule</span>
                    <div>
                      <p className="text-[8px] text-gray-500 font-bold uppercase">{t("TRAVEL TIME", "预计行驶时长")}</p>
                      <p className="text-xs font-bold text-gray-800">{plannerWaypoints.length * 45} min</p>
                    </div>
                  </div>
                  <div className="flex-1 bg-white/90 backdrop-blur-md px-3 py-2.5 rounded-xl border border-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[18px]">distance</span>
                    <div>
                      <p className="text-[8px] text-gray-500 font-bold uppercase">{t("DISTANCE", "预计路程总长")}</p>
                      <p className="text-xs font-bold text-gray-800">{(plannerWaypoints.length * 4.2).toFixed(1)} km</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Waypoints management block list */}
              <div className="bg-white rounded-2xl border border-gray-150 p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-display font-extrabold text-sm text-gray-800">{t("Route Waypoints", "路线途经目的地")}</h3>
                  <span className="bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full font-bold">
                    {plannerWaypoints.length} {t("Stops", "个停留点")}
                  </span>
                </div>

                {plannerWaypoints.length === 0 ? (
                  <div className="text-center py-6 text-gray-400 text-xs">
                    {t("No waypoints yet. Click button below to add!", "暂时没有目的地，请点击下方进行添加！")}
                  </div>
                ) : (
                  <div className="space-y-3 relative">
                    {/* Visual timeline path line helper */}
                    <div className="absolute left-[34px] top-[30px] bottom-[30px] w-0.5 bg-orange-200 z-0"></div>

                    {plannerWaypoints.map((wp, index) => (
                      <div 
                        key={wp.id}
                        className="relative z-10 flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200 hover:shadow-xs transition-shadow"
                      >
                        {/* Interactive Reordering controllers */}
                        <div className="flex flex-col items-center gap-1 shrink-0 text-gray-300">
                          <button 
                            disabled={index === 0}
                            onClick={() => handleMoveWaypoint(index, 'up')}
                            className="w-5 h-5 flex items-center justify-center rounded-md hover:bg-gray-200 disabled:opacity-30 cursor-pointer text-gray-600 font-semibold"
                          >
                            ▲
                          </button>
                          <button 
                            disabled={index === plannerWaypoints.length - 1}
                            onClick={() => handleMoveWaypoint(index, 'down')}
                            className="w-5 h-5 flex items-center justify-center rounded-md hover:bg-gray-200 disabled:opacity-30 cursor-pointer text-gray-600 font-semibold"
                          >
                            ▼
                          </button>
                        </div>

                        {/* Number Indicator badge of waypoint */}
                        <div className="w-8 h-8 rounded-full bg-secondary-container text-white flex items-center justify-center font-bold shadow-xs shrink-0 text-xs">
                          {index + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-gray-900 truncate">{wp.name}</h4>
                          <p className="text-[10px] text-gray-400 truncate mt-0.5">{wp.address || wp.description}</p>
                        </div>

                        <button 
                          onClick={() => handleDeleteWaypoint(wp.id)}
                          className="text-gray-400 hover:text-red-500 active:scale-90 transition-transform p-1 shrink-0 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Waypoint Button dashed trigger */}
                <button 
                  onClick={() => {
                    handleClearSearches();
                    setActiveSubScreen('search_location');
                  }}
                  className="w-full mt-4 py-4 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1.5 text-gray-500 hover:border-primary hover:bg-blue-50/20 active:scale-98 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-primary text-[28px]">add_location_alt</span>
                  <span className="text-xs font-semibold">{t("Search & Add Attraction Stops", "搜索并添加新目的地景点")}</span>
                </button>
              </div>

              {/* Action buttons bar */}
              <div className="flex gap-4">
                <button 
                  onClick={handleSavePlannerRoute}
                  className="flex-1 py-3.5 bg-primary text-white rounded-xl font-display font-bold text-xs uppercase shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-transform cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  {t("Save Route", "保存新设计路线")}
                </button>
                <button 
                  onClick={() => setActiveSubScreen('my_routes')}
                  className="flex-1 py-3.5 bg-gray-100 text-gray-800 rounded-xl font-display font-bold text-xs uppercase hover:bg-gray-250 active:scale-95 transition-transform flex items-center justify-center gap-1.5 border border-gray-200 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">folder_shared</span>
                  {t("My Saved Library", "管理定制路线")}
                </button>
              </div>

            </div>
          )}

          {/* ========================================== */}
          {/* ========== TAB 4: PROFILE & PERSONAL ===== */}
          {/* ========================================== */}
          {activeTab === 'profile' && (
            <div id="tab-profile-pane" className="space-y-6 animate-in fade-in duration-300">
              
              {/* Profile Header Block */}
              <div className="flex flex-col items-center py-4 bg-white rounded-2xl border border-gray-150 p-5 shadow-xs">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100 shadow-md">
                    <img 
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80" 
                      alt="Alex Rivera Profile" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button 
                    onClick={() => showToast(t("Avatar upload simulation activated.", "已开启头像更改模拟：请轻触本地相册照片上传"), "info")}
                    className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full border border-white shadow-md active:scale-90 transition-transform flex items-center justify-center cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">edit</span>
                  </button>
                </div>
                
                <h3 className="font-display font-extrabold text-lg text-gray-900 mt-3">
                  {isEnglish ? persona.name : (persona.nameZh || persona.name)}
                </h3>
                
                <div className="mt-1.5 flex items-center gap-1.5 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold shadow-2xs">
                  <span className="material-symbols-outlined text-[15px]">explore</span>
                  {isEnglish ? persona.title : (persona.titleZh || persona.title)}
                </div>
              </div>

              {/* Stats Bento Grid Box */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-2xs">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wide">{t("Route Check-ins", "行程打卡记录")}</span>
                  <div className="flex items-end gap-1.5 mt-1.5">
                    <span className="font-display font-extrabold text-2xl text-primary">{persona.stats.checkins}</span>
                    <span className="text-xs text-green-600 font-bold mb-1">▲ +12%</span>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-2xs">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wide">{t("Achievement Badges", "荣誉成就勋章")}</span>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="material-symbols-outlined text-secondary text-[24px]">workspace_premium</span>
                    <span className="font-display font-extrabold text-2xl text-gray-800">{persona.stats.badges}</span>
                  </div>
                </div>
                <div className="col-span-2 bg-white p-4 rounded-xl border border-gray-150 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wide">{t("LATEST ACHIEVEMENT", "近来解锁成就")}</span>
                    <p className="font-semibold text-[13px] text-gray-800 mt-1">
                      {isEnglish ? persona.stats.latestAchievement : (persona.stats.latestAchievementZh || persona.stats.latestAchievement)}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-green-50 flex items-center justify-center rounded-full shrink-0">
                    <span className="material-symbols-outlined text-green-700">terrain</span>
                  </div>
                </div>
              </div>

              {/* Personal travel setup panel */}
              <div className="bg-white rounded-2xl border border-gray-150 p-5 space-y-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-bold text-sm text-gray-800 uppercase tracking-wide">{t("Travel Portrait Persona", "定制我的旅行画像")}</h4>
                  <button 
                    onClick={() => {
                      setPersona(INITIAL_USER_PERSONA);
                      showToast(t("Persona reset to defaults.", "首选项已复位！旅行特征画像参数已恢复至初始配置。"), "success");
                    }}
                    className="text-xs text-primary underline font-bold cursor-pointer"
                  >
                    {t("Reset Profile", "重置偏好")}
                  </button>
                </div>

                {/* Multi chips choices interests */}
                <div>
                  <label className="text-[11px] text-gray-400 font-bold uppercase tracking-wide block mb-2">{t("Interests / Tags", "兴趣偏好偏好标签 (可多选)")}</label>
                  <div className="flex flex-wrap gap-2">
                    {["Nature", "Food", "History", "Art"].map(interest => {
                      const isActive = persona.interests.includes(interest);
                      return (
                        <button 
                          key={interest}
                          onClick={() => handleToggleInterest(interest)}
                          className={`px-3 py-2 rounded-full text-xs font-semibold border transition-all flex items-center gap-1 pr-3 cursor-pointer ${
                            isActive 
                              ? 'bg-primary text-white border-primary shadow-2xs' 
                              : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[13px]">
                            {interest === 'Nature' ? 'nature' : interest === 'Food' ? 'restaurant' : interest === 'History' ? 'history' : 'museum'}
                          </span>
                          {isEnglish ? interest : interest === 'Nature' ? '自然风光' : interest === 'Food' ? '特色美食' : interest === 'History' ? '人文历史' : '艺术博物'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Budget choice level */}
                <div>
                  <label className="text-[11px] text-gray-400 font-bold uppercase block tracking-wide mb-2">{t("Preferred Budget Class", "偏好预算层级")}</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { val: 'budget', label: t("Budget", "预算"), sign: "$" },
                      { val: 'mid', label: t("Mid-Range", "中端"), sign: "$$" },
                      { val: 'luxury', label: t("Luxury", "高端奢华"), sign: "$$$" },
                    ].map(b => {
                      const isSelected = persona.budgetLevel === b.val;
                      return (
                        <button 
                          key={b.val}
                          onClick={() => setPersona(p => ({ ...p, budgetLevel: b.val as any }))}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-blue-50 border-primary text-primary font-bold shadow-2xs scale-[1.03] ring-1 ring-primary' 
                              : 'bg-gray-50 border-gray-200 hover:border-gray-300 text-gray-600'
                          }`}
                        >
                          <span className="font-display text-lg">{b.sign}</span>
                          <span className="text-[10px] mt-0.5">{b.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Slider bar dynamic travel pace */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[11px] text-gray-400 font-bold uppercase block tracking-wide">{t("Travel Schedule Pace", "偏好的旅行节奏")}</label>
                    <span className="text-xs text-primary font-bold">
                      {persona.pace === 'active' ? t("Intense (Active)", "特种兵特快/活跃") : t("Relaxed (Slow)", "佛系舒缓慢节奏")}
                    </span>
                  </div>
                  
                  {/* Fake Interactive Toggle Bar */}
                  <div className="flex bg-gray-100 p-1.5 rounded-full border border-gray-200">
                    <button 
                      onClick={() => setPersona(p => ({ ...p, pace: 'relaxed' }))}
                      className={`flex-1 py-1.5 text-center text-xs rounded-full font-bold transition-all cursor-pointer ${
                        persona.pace === 'relaxed' ? 'bg-white text-primary shadow-xs' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {t("Relaxed", "温和舒适")}
                    </button>
                    <button 
                      onClick={() => setPersona(p => ({ ...p, pace: 'active' }))}
                      className={`flex-1 py-1.5 text-center text-xs rounded-full font-bold transition-all cursor-pointer ${
                        persona.pace === 'active' ? 'bg-white text-primary shadow-xs' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {t("Active / Intense", "特种兵 / 饱满")}
                    </button>
                  </div>
                </div>
              </div>

              {/* General Settings entry directly triggers and saves settings screen */}
              <div>
                <button 
                  onClick={() => {
                    showToast(t("Travel portrait preferences synchronized!", "旅行特征画像配置同步成功！此画像已注入 Wayfinder 全站推荐推荐引擎中心。"), "success");
                  }}
                  className="w-full py-4 bg-primary text-white rounded-xl font-display font-bold shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined">save</span>
                  {t("Save Travel Portrait Preferences", "保存我的特征画像")}
                </button>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ======================================================== */}
      {/* ==================== CONTEXTUAL OVERLAYS =============== */}
      {/* ======================================================== */}
      {activeSubScreen !== null && (
        <div className="flex-1 flex flex-col p-5 animate-in slide-in-from-right-10 duration-200">
          
          {/* =================================================== */}
          {/* ====== SCREEN overlay: SEARCH & CHOOSE WAYPOINTS == */}
          {/* =================================================== */}
          {activeSubScreen === 'search_location' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-display font-extrabold text-gray-900">{t("Search Locations", "搜索地点景点 - 加至路线")}</h2>
                <p className="text-xs text-gray-500">{t("Add destinations into custom path directly", "筛选并直接添加您即将去往的目的地")}</p>
              </div>

              {/* Sticky Search bar input */}
              <div className="bg-white py-1">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                  <input 
                    type="text" 
                    placeholder={t("Filter by keyword or name...", "搜索附近宝藏景点或历史古迹...")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full py-3.5 pl-10 pr-10 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-xs font-semibold text-gray-800 shadow-3xs"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">clear</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Search Result Category 1: Recent Searches */}
              {searchQuery === '' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <h3 className="text-xs font-display font-bold text-gray-500 uppercase tracking-wider">{t("Recent Searches", "最近的历史搜索")}</h3>
                    <button onClick={() => showToast(t("Searches cleared.", "最近的历史搜索纪录也清空完毕。"), "info")} className="text-[11px] text-primary hover:underline cursor-pointer">{t("Clear all", "清空史记")}</button>
                  </div>
                  
                  <div className="space-y-2">
                    {RECENT_SEARCHES.map((recent, rIdx) => {
                      // Find matching predefined object or build dummy
                      const matchWp: Waypoint = {
                        id: `recent_${rIdx}`,
                        name: recent.title,
                        nameZh: recent.titleZh,
                        description: recent.subtitle,
                        descriptionZh: recent.subtitleZh,
                        address: "Custom search location"
                      };
                      const isSelected = tempSelectedWaypoints.some(item => item.name === recent.title);
                      
                      return (
                        <div 
                          key={rIdx}
                          className="flex items-center justify-between p-3.5 bg-white border border-gray-150 rounded-xl hover:shadow-xs transition-shadow"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                              <span className="material-symbols-outlined text-[18px]">history</span>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-800">
                                {isEnglish ? recent.title : (recent.titleZh || recent.title)}
                              </p>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                {isEnglish ? recent.subtitle : (recent.subtitleZh || recent.subtitle)}
                              </p>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => handleToggleSearchWaypointSelection(matchWp)}
                            className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-90 ${
                              isSelected 
                                ? 'bg-green-700 text-white' 
                                : 'bg-primary text-white hover:brightness-110'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[18px]">{isSelected ? 'check' : 'add'}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Search Result Category 2: Nearby Places Cards */}
              <div className="space-y-3 pb-32">
                <h3 className="text-xs font-display font-bold text-gray-500 uppercase tracking-wider px-1">
                  {searchQuery ? t("Found Results", "匹配结果列表") : t("Explore Nearby Places", "附近的推荐去处")}
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  {GLOBAL_RECOMMENDED_WAYPOINTS
                    .filter(w => searchQuery === '' || w.name.toLowerCase().includes(searchQuery.toLowerCase()) || (w.nameZh && w.nameZh.toLowerCase().includes(searchQuery.toLowerCase())))
                    .map(wp => {
                      const isSelected = tempSelectedWaypoints.some(item => item.id === wp.id);
                      return (
                        <div key={wp.id} className="bg-white border border-gray-150 rounded-xl overflow-hidden hover:shadow-sm transition-all flex flex-col">
                          <div className="h-28 bg-gray-100 relative">
                            {wp.imageUrl && <img src={wp.imageUrl} alt={wp.name} className="w-full h-full object-cover" />}
                            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm text-[10px] font-bold text-secondary">
                              <span className="material-symbols-outlined text-secondary text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                              {wp.rating || 4.7}
                            </div>
                          </div>
                          
                          <div className="p-3 flex items-start justify-between gap-2">
                            <div>
                              <h4 className="text-xs font-bold text-gray-800">
                                {isEnglish ? wp.name : (wp.nameZh || wp.name)}
                              </h4>
                              <p className="text-[10px] text-gray-400 flex items-center gap-0.5 mt-0.5">
                                <span className="material-symbols-outlined text-[12px]">pin_drop</span>
                                {isEnglish ? wp.description : (wp.descriptionZh || wp.description)}
                              </p>
                            </div>
                            
                            <button 
                              onClick={() => handleToggleSearchWaypointSelection(wp)}
                              className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-90 shrink-0 ${
                                isSelected 
                                  ? 'bg-green-700 text-white' 
                                  : 'bg-primary-container text-white hover:brightness-110'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[18px]">{isSelected ? 'check' : 'add'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Floating bottom status drawer for items selection (Selected 3 Done) */}
              <div className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto z-50 bg-gray-900 text-white p-4 rounded-xl shadow-2xl glass-effect flex items-center justify-between border border-gray-850">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-3 select-none">
                    {tempSelectedWaypoints.slice(0, 3).map((item, idx) => (
                      <div 
                        key={idx} 
                        className={`w-8 h-8 rounded-full border-2 border-slate-900 flex items-center justify-center font-bold text-[10px] ${
                          idx === 0 ? 'bg-primary' : idx === 1 ? 'bg-amber-600' : 'bg-green-700'
                        }`}
                      >
                        {idx + 1}
                      </div>
                    ))}
                    {tempSelectedWaypoints.length === 0 && (
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-slate-300">
                        0
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider">{t(`Selected (${tempSelectedWaypoints.length})`, `已选择并圈定 (${tempSelectedWaypoints.length}个)`)}</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">{t("Nature Exploration Route", "自然风景探索定制推荐")}</p>
                  </div>
                </div>
                
                <button 
                  onClick={handleDoneSearchingAndAdding}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg text-xs font-bold active:scale-95 transition-transform shrink-0 cursor-pointer"
                >
                  {t("Done", "确定添加")}
                </button>
              </div>

            </div>
          )}

          {/* =================================================== */}
          {/* ====== SCREEN overlay: INTERACTIVE ROUTE DETAIL === */}
          {/* =================================================== */}
          {activeSubScreen === 'route_detail' && (
            <div className="space-y-5 pb-24">
              
              {/* Detail Tokyo maps viewport preview */}
              <div className="relative rounded-2xl overflow-hidden shadow-md border border-gray-200">
                <div className="h-[210px] bg-slate-100">
                  <img 
                    src="https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=400&q=80" 
                    alt="Itinerary Route Map" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Floating GPS layered controller icons */}
                <div className="absolute right-3 bottom-3 flex flex-col gap-2">
                  <button onClick={() => showToast(t("Map orientation aligned and angle locked.", "地图高精度仰角及三维罗盘方位已锁定。"), "success")} className="w-10 h-10 bg-white rounded-lg shadow-xs flex items-center justify-center text-primary cursor-pointer active:scale-95">
                    <span className="material-symbols-outlined text-[20px]">explore</span>
                  </button>
                </div>
              </div>

              {/* Itinerary overview detailed heading block */}
              <div className="bg-white rounded-2xl border border-gray-150 p-4 space-y-4 shadow-2xs">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h2 className="text-[20px] font-display font-extrabold text-gray-900 tracking-tight">
                      {isEnglish ? activeRoute.name : (activeRoute.nameZh || activeRoute.name)}
                    </h2>
                    <p className="text-xs text-primary font-bold flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      {getItineraryTimes(activeRoute.durationMin, transportMode)} {t("minutes in total", "分钟总时长")} ({(activeRoute.distanceNum).toFixed(1)} km)
                    </p>
                  </div>
                  
                  {/* Action sharing tags */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <button 
                      onClick={() => showToast(t("Your customized offline travel map was generated and saved to album!", "您的专属旅行路径连线图已成功保存到相册，并已生成微信/好友社交分享口令！"), "success")}
                      className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-3 py-1.5 text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer active:scale-90 transition-transform"
                    >
                      <span className="material-symbols-outlined text-[12px]">share</span>
                      {t("Save & Share", "保存分享")}
                    </button>
                    
                    <button 
                      onClick={() => {
                        setActiveSubScreen('group_share');
                        showToast(t("Route loaded into your Group explorer session!", "该旅行规划路线已成功推送共享至探索群组！群组成员位置已在路线上同步激活连结。"), "success");
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded-full px-3 py-1.5 text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer active:scale-90 transition-transform"
                    >
                      <span className="material-symbols-outlined text-[12px]">group</span>
                      {t("Share to Group", "推送到小组")}
                    </button>
                  </div>
                </div>

                {/* transportswitcher walker bik transit or car */}
                <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl">
                  {[
                    { id: 'walk', label: t("Walk", "步行"), icon: 'directions_walk' },
                    { id: 'bike', label: t("Bike", "骑行"), icon: 'directions_bike' },
                    { id: 'transit', label: t("Transit", "公交"), icon: 'directions_bus' },
                    { id: 'drive', label: t("Drive", "驾车"), icon: 'directions_car' },
                  ].map(mode => {
                    const isActive = transportMode === mode.id;
                    return (
                      <button 
                        key={mode.id}
                        onClick={() => {
                          setTransportMode(mode.id as any);
                        }}
                        className={`mode-btn flex-1 flex flex-col items-center gap-0.5 py-2.5 rounded-lg transition-transform cursor-pointer duration-200 ${
                          isActive 
                            ? 'bg-white text-secondary font-bold shadow-xs' 
                            : 'text-gray-500 hover:bg-white/40'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">{mode.icon}</span>
                        <span className="text-[9px] uppercase tracking-wider">{mode.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic step-by-step Itinerary List */}
              <div className="space-y-4">
                <h3 className="font-display font-extrabold text-sm text-gray-800 mb-1">{t("Itinerary Detail Steps", "大盘行程单与换乘路线")}</h3>
                
                {activeRoute.waypoints.length === 0 ? (
                  <div className="bg-white border border-gray-150 p-5 rounded-xl text-center text-xs text-gray-400">
                    {t("Predefined default tourist route for preview. No waypoints declared.", "此经典热门推荐路线可直接开启一键出发智能指引系统。")}
                    <div className="mt-2 text-[10px] text-gray-400 italic">
                      1. Piazza San Marco Overlook (1.2 km Walk) <br/>
                      2. Ponte di Rialto Overlook (1.8 km Walk) <br/>
                      3. Palazzo Ducale Basilica (Destination)
                    </div>
                  </div>
                ) : (
                  <div className="relative space-y-4">
                    {/* timeline line connecting items */}
                    <div className="absolute left-[23px] top-[24px] bottom-[24px] w-0.5 bg-gray-200"></div>

                    {activeRoute.waypoints.map((wp, wIdx) => (
                      <div key={wp.id} className="relative z-10">
                        {/* Step block stop card */}
                        <div className="flex gap-4 items-start">
                          <div className={`w-11 h-11 rounded-full text-white flex items-center justify-center font-bold shadow-xs text-xs ${
                            isNavigating && navigationStep >= wIdx + 1 
                              ? 'bg-green-700 animate-pulse' 
                              : 'bg-primary'
                          }`}>
                            {wIdx + 1}
                          </div>
                          
                          <div className="flex-1 bg-white border border-gray-150 p-3.5 rounded-xl">
                            <h4 className="text-xs font-bold text-gray-900">
                              {isEnglish ? wp.name : (wp.nameZh || wp.name)}
                            </h4>
                            <p className="text-[10px] text-gray-400 mt-1">
                              {isEnglish ? wp.description : (wp.descriptionZh || wp.description || "Scenic Overlook Stop")}
                            </p>
                          </div>
                        </div>

                        {/* Connection Segment description between waypoints */}
                        {wIdx < activeRoute.waypoints.length - 1 && (
                          <div className="ml-14 pl-4 py-2 border-l-2 border-dashed border-gray-100 flex flex-col my-1 text-[11px] text-slate-500">
                            <span className="font-bold text-slate-700">
                              {transportMode === 'walk' && `${15} min ${t("walk", "步行")} (1.2 km)`}
                              {transportMode === 'bike' && `${5} min ${t("bike", "骑车")} (1.2 km)`}
                              {transportMode === 'transit' && `${8} min ${t("bus / transit", "公交/地铁")} (1.2 km)`}
                              {transportMode === 'drive' && `${3} min ${t("drive", "驾车车程")} (1.2 km)`}
                            </span>
                            <span className="text-[10px] text-gray-400">{t("Via standard central urban avenue pathway.", "途经林荫大道及著名步行街区，平缓好走")}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* simulated navigation block controls */}
              {isNavigating ? (
                <div className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto z-50 bg-green-800 text-white p-4 rounded-xl shadow-2xl flex items-center justify-between border border-green-750">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[30px] text-orange-200 animate-bounce">navigation</span>
                    <div>
                      <p className="text-[10px] text-green-200 font-bold uppercase">{t("LIVE REAL-TIME NAVIGATING ACTIVE", "实时步行指引导航进行中")}</p>
                      <p className="text-xs font-bold">
                        {t("Heading to Stop ", "指引您朝向第")} {navigationStep}: {isEnglish ? (activeRoute.waypoints[navigationStep - 1]?.name) : (activeRoute.waypoints[navigationStep - 1]?.nameZh || activeRoute.waypoints[navigationStep - 1]?.name || t("Destination Target", "终点"))}
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleNextStepNav}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg text-xs font-bold active:scale-95 transition-all cursor-pointer"
                  >
                    {navigationStep === activeRoute.waypoints.length ? t("Complete", "完成路线") : t("Next Stop", "已到此站")}
                  </button>
                </div>
              ) : (
                <div className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto z-50">
                  <button 
                    onClick={handleStartNavigationSim}
                    className="w-full py-4 bg-primary text-white text-xs font-display font-bold rounded-xl shadow-lg hover:brightness-111 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">navigation</span>
                    {t("One-click Launch Guidance GPS", "开启一键出发智能路线导航")}
                  </button>
                </div>
              )}

            </div>
          )}

          {activeSubScreen === 'group_share' && (
            <div className="flex-1 flex flex-col h-[calc(100vh-100px)] relative justify-between gap-4 pb-2">
              
              {/* Group Map View (Top Section) */}
              <div className="relative rounded-2xl overflow-hidden h-44 shrink-0 border border-gray-150 shadow-xs">
                <img 
                  src="https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=400&q=80" 
                  alt="Group Trail Map" 
                  className="w-full h-full object-cover"
                />
                
                {/* Simulated live syncing active status tag */}
                <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-[9px] text-green-400 font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping"></span>
                  LIVE SYNC ACTIVE
                </div>

                {/* scattered member avatars scattered on trail map */}
                <div className="absolute top-[35%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <img src={groupMembers[0].avatar} className="w-8 h-8 rounded-full border-2 border-primary object-cover" alt="Me" />
                  <span className="bg-primary text-white text-[8px] font-bold px-1 py-0.2 rounded-md mt-0.5 shadow-2xs">Alex(Me)</span>
                </div>
                
                <div className="absolute top-[20%] left-[80%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <img src={groupMembers[1].avatar} className="w-6 h-6 rounded-full border-2 border-orange-500 object-cover" alt="Sarah" />
                  <span className="bg-slate-900/80 text-white text-[8px] px-1 py-0.2 rounded-md mt-0.5 shadow-2xs">Sarah</span>
                </div>

                <div className="absolute top-[65%] left-[25%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <img src={groupMembers[2].avatar} className="w-6 h-6 rounded-full border-2 border-slate-500 object-cover" alt="Chen" />
                  <span className="bg-slate-900/80 text-white text-[8px] px-1 py-0.2 rounded-md mt-0.5 shadow-2xs">Chen</span>
                </div>
              </div>

              {/* Group live lists progress */}
              <div className="space-y-3 bg-white border border-gray-150 p-4 rounded-xl shadow-3xs shrink-0">
                <div className="flex justify-between items-center px-1">
                  <h3 className="font-display font-extrabold text-sm text-gray-850">{t("Group Progress Stats", "旅行小组位置进度看板")}</h3>
                  <button 
                     onClick={() => showToast(t("Manual position ping sent standard message to Sarah and Chen.", "实时位置心跳已校准，已成功召唤并给队友 Sarah 和 Chen 发送呼叫通知！"), "success")} 
                     className="text-primary text-[10px] font-bold hover:underline cursor-pointer"
                  >
                    {t("Ping Teammates", "同步召唤队友")}
                  </button>
                </div>

                <div className="space-y-2 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                  {groupMembers.map(member => (
                    <div key={member.id} className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-150">
                      <div className="relative">
                        <img src={member.avatar} className="w-8 h-8 rounded-full object-cover shadow-2xs border border-gray-100" alt={member.name} />
                        {member.id === 'm_me' && (
                          <span className="absolute -top-1 -right-1 bg-primary text-[6px] text-white px-1 rounded-full font-bold">ME</span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-gray-800">
                            {isEnglish ? member.name : (member.nameZh || member.name)}
                          </span>
                          <span className={`font-semibold ${
                            member.status === 'lead' ? 'text-orange-600' : member.status === 'waypoint' ? 'text-primary' : 'text-gray-500'
                          }`}>
                            {member.status === 'lead' 
                              ? t("In Lead", "领跑领先") 
                              : member.status === 'waypoint' 
                              ? (isEnglish ? member.waypointText : (member.waypointTextZh || member.waypointText)) 
                              : t("Following", "跟随中")}
                          </span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-1 h-1.5 overflow-hidden mt-1 max-w-[200px]">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${
                              member.id === 'm_me' ? 'bg-primary' : member.status === 'lead' ? 'bg-orange-500' : 'bg-gray-400'
                            }`}
                            style={{ width: `${member.progress}%` }}
                          ></div>
                        </div>
                        
                        <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-0.5 font-medium">
                          <span className="material-symbols-outlined text-[11px]">route</span>
                          {isEnglish ? member.distanceLeft : (member.distanceLeftZh || member.distanceLeft)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Group live Chat record list (Interactive Send Console) */}
              <div className="flex-1 flex flex-col justify-between bg-white border border-gray-150 p-4 rounded-xl shadow-3xs overflow-hidden min-h-[160px]">
                <div className="text-xs font-display font-semibold text-gray-500 mb-2 pb-2 border-b border-gray-100 uppercase tracking-widest flex items-center justify-between">
                  <span>{t("Group Chat Feed", "小组聊天室频道")}</span>
                  <span className="text-[10px] text-green-700 bg-green-50 px-2 rounded-full font-bold">CONNECTED</span>
                </div>

                {/* Messages pane scroll area */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar text-xs max-h-[150px]">
                  {chatMessages.map(msg => (
                    <div 
                      key={msg.id} 
                      className={`flex flex-col max-w-[80%] ${msg.isMe ? 'ml-auto items-end animate-in slide-in-from-right-3' : 'mr-auto items-start animate-in slide-in-from-left-3'}`}
                    >
                      <span className="text-[9px] text-gray-400 font-bold mb-0.5">
                        {isEnglish ? msg.sender : (msg.sender === 'Sarah' ? '莎拉' : msg.sender === 'Chen' ? '小陈' : msg.sender === 'Alex' ? '亚历克斯' : msg.sender)} • {msg.time}
                      </span>
                      <div className={`p-2.5 rounded-xl leading-relaxed font-sans ${
                        msg.isMe 
                          ? 'bg-primary text-white rounded-tr-xs shadow-3xs' 
                          : 'bg-gray-100 text-gray-700 rounded-tl-xs border border-gray-200'
                      }`}>
                        {isEnglish ? msg.text : (msg.textZh || msg.text)}
                      </div>
                    </div>
                  ))}
                  <div ref={chatBottomRef} />
                </div>

                {/* Interactive submit chat form */}
                <form onSubmit={handleSendChatMessage} className="mt-3 flex items-center gap-2 pt-2 border-t border-gray-100">
                  <button 
                    type="button"
                    onClick={() => showToast(t("Simulated photo attachment: Select picture to post to feed.", "已开启拍照分享模拟：请在弹出的系统相册中选取图片发布。"), "info")}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center shrink-0 cursor-pointer animate-pulse"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  </button>
                  <div className="relative flex-1">
                    <input 
                      type="text" 
                      placeholder={t("Message the group...", "聊两句，发送给共享小组成员...")}
                      value={currentChatInput}
                      onChange={(e) => setCurrentChatInput(e.target.value)}
                      className="w-full bg-gray-100 rounded-full py-2.5 px-4 pr-11 border-none focus:outline-none focus:ring-1 focus:ring-primary/20 text-xs font-sans text-gray-700 shadow-3xs placeholder-gray-400"
                    />
                    <button 
                      type="submit"
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary hover:bg-blue-700 text-white rounded-full flex items-center justify-center active:scale-90 transition-transform shrink-0 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">send</span>
                    </button>
                  </div>
                </form>
              </div>

            </div>
          )}

          {/* =================================================== */}
          {/* ====== SCREEN overlay: GLOBAL APP SETTINGS ======== */}
          {/* =================================================== */}
          {activeSubScreen === 'settings' && (
            <div className="space-y-6">
              
              {/* Premium Membership Banner Header */}
              <div className="flex items-center gap-4 py-3 bg-white rounded-2xl border border-gray-150 p-4 shadow-3xs">
                <div className="relative">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjm4NMdYC7gluNjceIaSnqbHDLI4rcunenPwasgjFAg54cD1L3mZk9LYSGXW_FCDHaSbcF22mumrXZx1vstdhghb4c7b3Aw4h0nrLYb6dEnzidaJ4JEvK28pmAZqLo-btseVGo1LmSIIIoLq3D01KfLdSwcW_9CFEsAuuLw4KpeKk4wAGrZhDkbPer02gJWNJVXpqEKO4mJX5OP3w6pvD_tsN-Kk-5oYNST7LduRNc7DA560I8ivfakSaSbgc8B1grTGsSyjIFUQuB" 
                    alt="Alex Rivera Settings profile" 
                    className="w-16 h-16 rounded-full object-cover border border-primary shadow-xs"
                  />
                  <div className="absolute bottom-0 right-0 bg-orange-500 border border-white text-white p-1 rounded-full shadow-2cs flex items-center justify-center">
                    <span className="material-symbols-outlined text-[12px] font-bold">workspace_premium</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-gray-900 text-base">Alex Rivera</h3>
                  <p className="text-[11px] text-secondary font-bold uppercase tracking-wider">{t("WAYFINDER PREMIUM EXPLORER", "Wayfinder 尊享黄金会员")}</p>
                </div>
              </div>

              {/* Group SECTION 1: ACCOUNT */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-display font-bold text-gray-400 uppercase tracking-widest pl-1">{t("ACCOUNT SERVICES", "账号与安全")}</h4>
                <div className="bg-white rounded-xl border border-gray-150 overflow-hidden shadow-3xs divide-y divide-gray-100 text-gray-700">
                  <button 
                    onClick={() => { setActiveTab('profile'); setActiveSubScreen(null); }}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors text-xs font-semibold cursor-pointer"
                  >
                    <span className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-gray-500">person</span>
                      {t("Edit Profile Portrait", "修改个人信息和画像")}
                    </span>
                    <span className="material-symbols-outlined text-gray-300 text-[18px]">chevron_right</span>
                  </button>
                  <button 
                    onClick={() => showToast(t("Authorized. Standard face/secure biometric checks verified successfully.", "指纹与安全高级加密令牌身份校验成功，已成功验证！"), "success")}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors text-xs font-semibold cursor-pointer"
                  >
                    <span className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-gray-500">lock</span>
                      {t("Account Security & Privacy", "隐私与数据保护条例")}
                    </span>
                    <span className="material-symbols-outlined text-gray-300 text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>

              {/* Group SECTION 2: PREFERENCES */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-display font-bold text-gray-400 uppercase tracking-widest pl-1">{t("PREFERENCES", "通用偏好设置")}</h4>
                <div className="bg-white rounded-xl border border-gray-150 overflow-hidden shadow-3xs divide-y divide-gray-100 text-gray-700 text-xs font-semibold">
                  
                  {/* Language segment control (English vs Chinese) */}
                  <div className="flex items-center justify-between p-3.5">
                    <span className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-gray-500">language</span>
                      {t("Language Switch", "系统语言 / Language")}
                    </span>
                    <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                      <button 
                        onClick={() => setIsEnglish(true)}
                        className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${isEnglish ? 'bg-white text-primary shadow-xs' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        English
                      </button>
                      <button 
                        onClick={() => setIsEnglish(false)}
                        className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${!isEnglish ? 'bg-white text-primary shadow-xs' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        中文 / Chinese
                      </button>
                    </div>
                  </div>

                  {/* Toggle notification toggle */}
                  <div className="flex items-center justify-between p-3.5">
                    <span className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-gray-500">notifications_active</span>
                      {t("Real-time Group Push Alerts", "同步接收小组状态推送消息")}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={isNotifications}
                        onChange={() => setIsNotifications(p => !p)}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Group SECTION 3: ABOUT v1.2.4 */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-display font-bold text-gray-400 uppercase tracking-widest pl-1">{t("ABOUT WAYFINDER", "关于系统")}</h4>
                <div className="bg-white rounded-xl border border-gray-150 overflow-hidden shadow-3xs divide-y divide-gray-100 text-gray-700 text-xs font-semibold">
                  <div className="flex items-center justify-between p-3.5">
                    <span className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-gray-500">info</span>
                      {t("Software Version", "软件版本号")}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">v1.2.4</span>
                  </div>
                  
                  <button 
                    onClick={() => showToast(t("Wayfinder Terms of Service are loaded. Authorized for legal use in sandbox environment.", "《用户协议服务手册》已开启微缩预览，本平台保障您的合法合规使用权！"), "info")}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 text-left cursor-pointer"
                  >
                    <span className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-gray-500">description</span>
                      {t("Terms of Service", "Wayfinder 用户服务协议")}
                    </span>
                    <span className="material-symbols-outlined text-gray-300 text-[18px]">open_in_new</span>
                  </button>

                  <button 
                    onClick={() => showToast(t("Wayfinder Privacy Policy verified. All data stored strictly inside client session.", "《隐私政策保护条例》已核验通过。系统坚决守护您的本地存储会话隐私安全！"), "info")}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 text-left cursor-pointer"
                  >
                    <span className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-gray-500">policy</span>
                      {t("Privacy Policy Guidelines", "个人隐私合规守护政策条例")}
                    </span>
                    <span className="material-symbols-outlined text-gray-300 text-[18px]">open_in_new</span>
                  </button>
                </div>
              </div>

              {/* Log out action */}
              <div className="pt-2">
                <button 
                  onClick={() => {
                    showConfirm(
                      t("Confirm Sign Out?", "确定要注销登录吗？"),
                      t("This action clears local cache. All predefined routes will restore to initials.", "此操作将注销当前演示账号并清理本地缓存数据。是否确定并重置默认预置路线？"),
                      () => {
                        localStorage.clear();
                        setPersona(INITIAL_USER_PERSONA);
                        setSavedRoutes(SAVED_ROUTES);
                        setActiveSubScreen(null);
                        setActiveTab('home');
                        showToast(t("Logged out. Local preferences cleared and restored successfully.", "已成功注销登录，本地专属缓存及路线规则已退化重置！"), "info");
                      }
                    );
                  }}
                  className="w-full py-4 bg-white border border-red-500 text-red-500 font-display font-bold text-xs rounded-xl shadow-xs hover:bg-red-50 active:scale-95 transition-transform flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined">logout</span>
                  {t("Sign Out Account", "退出当前账号登录")}
                </button>
                <p className="text-center text-gray-300 text-[9px] italic mt-4">
                  Crafted with passion by the Wayfinder Team © 2026
                </p>
              </div>

            </div>
          )}

          {/* =================================================== */}
          {/* ====== SCREEN overlay: SAVED ROUTES MANAGER ======= */}
          {/* =================================================== */}
          {activeSubScreen === 'my_routes' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-display font-extrabold text-gray-900">{t("My Saved Routes", "我的定制路线管理")}</h2>
                <p className="text-xs text-gray-500">{t("View and edit your personal travels in one database", "管理或删除您编辑成功的定制路线及探险轨迹库")}</p>
              </div>

              {/* Local Search inside route library */}
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                <input 
                  type="text" 
                  placeholder={t("Filter saved route names...", "按关键词检索我保存过的行程方案...")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-3 pl-10 pr-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary text-xs font-semibold text-gray-800"
                />
              </div>

              {/* Dynamic list grid of saved path cards */}
              <div className="space-y-4 pb-10">
                {filteredSavedRoutes.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-xs bg-white rounded-xl border border-dashed border-gray-200 p-6 flex flex-col justify-center items-center gap-3">
                    <span className="material-symbols-outlined text-[35px] text-gray-300">timeline</span>
                    {t("No routes match your search.", "没有查询到匹配的保存路径。")}
                  </div>
                ) : (
                  filteredSavedRoutes.map(route => (
                    <div 
                      key={route.id}
                      onClick={() => {
                        setActiveRoute(route);
                        setActiveSubScreen('route_detail');
                      }}
                      className="group bg-white rounded-xl border border-gray-150 overflow-hidden shadow-xs hover:shadow-md transition-all divide-y divide-gray-100 cursor-pointer"
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="bg-blue-50 text-primary text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                              {route.category}
                            </span>
                            <h3 className="font-display font-bold text-sm text-gray-900 mt-1.5">{route.name}</h3>
                            <p className="text-[10px] text-gray-400 mt-1">{route.description}</p>
                          </div>
                          
                          {/* action button triggers */}
                          <div className="flex gap-1.5 relative z-10">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setPlannerWaypoints(route.waypoints.length > 0 ? route.waypoints : PLANNER_WAYPOINTS);
                                setActiveTab('planner');
                                setActiveSubScreen(null);
                                showToast(t("Itinerary loaded to workspace. Feel free to reorder or add stops!", "定制旅行路线已成功载入工作台编辑器。您可以在下方自由调整和排序途经点！"), "success");
                              }}
                              className="bg-gray-100 text-gray-700 hover:bg-primary hover:text-white p-2 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                              title="Edit Route"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                            <button 
                              onClick={(e) => handleDeleteSavedRoute(route.id, e)}
                              className="bg-red-50 text-red-500 hover:bg-red-100 p-2 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                              title="Delete route"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>
                        </div>

                        {/* Route simple stats */}
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-[11px] font-bold text-gray-500">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">distance</span>
                            {route.distanceNum} km
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">schedule</span>
                            {route.durationMin} min
                          </span>
                          <span className="flex items-center gap-1 text-secondary ml-auto">
                            <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            {route.rating}
                          </span>
                        </div>
                      </div>

                      {/* Topographical miniature preview map */}
                      <div className="h-16 relative overflow-hidden bg-slate-50">
                        <img 
                          src={route.mapUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuBD0Ss0G37LUUwuC9a_ptFXPPtnSZv7zI8OCnZdT9K64t9RREbTeXOQRdDv_fUgQg0YMdGzmUsETOwl9XmcleCZzmSbcK66jiNMvMYrcgwGTnz0piPnhZ1L_nt0SXblszitqri3nZ4rxVTNVvJHlN11fOWs-oyNBOlmAo9-3R1KkVzrnuUPihXrErLc0lbSjrS5q1N0yW-kPgTOqoErRuHI37Dh9IZjdVy3dxoOkKQmoP0MUytVZjfo9W3ln20Y7hUlKgijmrrDNOL1"} 
                          alt="Mini Topo Map" 
                          className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                        />
                      </div>
                    </div>
                  ))
                )}

                {/* Empty State / Add Blank card */}
                <div 
                  onClick={() => {
                    setPlannerWaypoints([]);
                    setActiveTab('planner');
                    setActiveSubScreen(null);
                  }}
                  className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center p-6 bg-white hover:border-primary hover:bg-blue-50/10 active:scale-[0.99] transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-primary group-hover:text-white transition-all flex items-center justify-center mb-2">
                    <span className="material-symbols-outlined text-[20px]">add</span>
                  </div>
                  <h4 className="text-xs font-display font-bold text-gray-800 tracking-tight group-hover:text-primary transition-colors">{t("Start New Journey", "规划新的专属旅行路线")}</h4>
                  <p className="text-[10px] text-gray-400 mt-1">{t("Tap to build and draw custom paths from scratch", "自主配置目的地，从零自定义设计完美的旅程方案")}</p>
                </div>
              </div>

              {/* Urgent FAB custom routes setup */}
              <div className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto z-45">
                <button 
                  onClick={() => {
                    setPlannerWaypoints([]);
                    setActiveTab('planner');
                    setActiveSubScreen(null);
                  }}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-display font-bold text-xs uppercase tracking-wider rounded-xl shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined">add_road</span>
                  {t("Create New Customized Itinerary", "创建全新的旅行路线规划")}
                </button>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ======================================================== */}
      {/* ==================== BOTTOM TAB BAR ==================== */}
      {/* ======================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-150 z-40 flex justify-around items-center px-4 max-w-2xl mx-auto rounded-t-2xl shadow-xl">
        {[
          { id: 'home', label: t("Home", "首页"), icon: 'home' },
          { id: 'map', label: t("Map", "实时地图"), icon: 'explore' },
          { id: 'planner', label: t("Planner", "路线定制"), icon: 'route' },
          { id: 'profile', label: t("Profile", "旅行画像"), icon: 'person' },
        ].map(tab => {
          const isSelected = activeTab === tab.id && activeSubScreen === null;
          return (
            <button 
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setActiveSubScreen(null);
              }}
              className={`flex flex-col items-center justify-center w-16 h-16 transition-all active:scale-90 duration-150 cursor-pointer ${
                isSelected 
                  ? 'text-orange-500 font-extrabold' 
                  : 'text-gray-400 hover:text-gray-500'
              }`}
            >
              <span className="material-symbols-outlined text-[23.5px] select-none" style={{ fontVariationSettings: isSelected ? "'FILL' 1" : "'FILL' 0" }}>
                {tab.icon}
              </span>
              <span className="text-[10px] font-semibold mt-1 tracking-wider leading-none">
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ======================================================== */}
      {/* ==================== CUSTOM TOAST ALERT ================ */}
      {/* ======================================================== */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[150] w-11/12 max-w-sm bg-slate-900 border border-slate-800 text-white rounded-xl shadow-2xl p-4 flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="mt-0.5 shrink-0">
            {toastType === 'success' ? (
              <span className="material-symbols-outlined text-green-400 text-[20px]">check_circle</span>
            ) : toastType === 'error' ? (
              <span className="material-symbols-outlined text-red-500 text-[20px]">error</span>
            ) : (
              <span className="material-symbols-outlined text-blue-400 text-[20px]">info</span>
            )}
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold leading-relaxed font-sans">{toastMessage}</p>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white shrink-0 active:scale-90 transition-transform cursor-pointer">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* ==================== CUSTOM CONFIRM MODAL ================= */}
      {/* ======================================================== */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300" onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}></div>
          <div className="relative bg-white border border-slate-100 rounded-2xl shadow-2xl max-w-sm w-full p-5 flex flex-col gap-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-red-600 text-[22px]">warning</span>
              </div>
              <h3 className="text-sm font-display font-bold text-gray-950">{confirmModal.title}</h3>
            </div>
            
            <p className="text-xs text-gray-600 leading-relaxed font-sans">
              {confirmModal.message}
            </p>
            
            <div className="flex gap-3 justify-end mt-2">
              <button 
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-xs font-semibold active:scale-95 transition-transform cursor-pointer"
              >
                {t("Cancel", "取消")}
              </button>
              <button 
                onClick={confirmModal.onConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold active:scale-95 transition-transform shadow-sm shadow-red-100 cursor-pointer"
              >
                {t("Confirm", "确认")}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
