"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Suspense, use, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { opinionPro } from "./Font";
import { IoIosArrowForward } from "react-icons/io";
import { Collapse, Spin } from "antd";
import { BsDiscord, BsInstagram, BsTwitterX } from "react-icons/bs";
import { useAccount, useDisconnect, useSignMessage } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useDispatch, useSelector } from "react-redux";
import { setJumpPage } from "@/store/slice/pageSlice";
import { MdDashboard, MdLogout, MdNotificationsOff, MdWallet } from "react-icons/md";
import { FaRegUserCircle } from "react-icons/fa";
import { useAuth } from '@/hooks/useAuth';
import Image from "next/image";
import { RootState } from "@/store";

const randomCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";

const Divider = () => {
  return <div className="bg-black/10 w-full h-[0.15rem]" />
}

const Sidebar = ({ isOpenMenu }: { isOpenMenu: boolean }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [menuText, setMenuText] = useState<string[]>(["", "", ""]);
  const [hoverState, setHoverState] = useState<boolean[]>([false, false, false]);

  useEffect(() => {
    if (!isOpenMenu) return;

    const targetMenus = ["Home", "TN7 Universe", "Comic", "Lore", "World Map",
      "Videos", "Public Entries", "Citizen", "Socials",
      "X", "Discord", "Instagram", "Discover More"
    ];
    const intervals: NodeJS.Timeout[] = [];

    targetMenus.forEach((menu, index) => {
      let currentText = "";
      let iteration = 0;

      const interval = setInterval(() => {
        currentText = menu
          .split("")
          .map((char, i) => (i < iteration ? char : randomCharacters[Math.floor(Math.random() * randomCharacters.length)]))
          .join("");

        setMenuText((prev) => {
          const updated = [...prev];
          updated[index] = currentText;
          return updated;
        });

        if (iteration >= menu.length) {
          clearInterval(interval);
        } else {
          iteration++;
        }
      }, 50);

      intervals.push(interval);
    });

    return () => {
      intervals.forEach((interval) => clearInterval(interval));
    };
  }, [isOpenMenu]);

  useEffect(() => {
    if (isOpenMenu) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpenMenu]);

  const handleMouseEnter = (index: number, targetText: string) => {
    setHoverState((prev) => {
      const updated = [...prev];
      updated[index] = true;
      return updated;
    });

    let currentText = "";
    let iteration = 0;

    const interval = setInterval(() => {
      currentText = targetText
        .split("")
        .map((char, i) => (i < iteration ? char : randomCharacters[Math.floor(Math.random() * randomCharacters.length)]))
        .join("");

      setMenuText((prev) => {
        const updated = [...prev];
        updated[index] = currentText;
        return updated;
      });

      if (iteration >= targetText.length) {
        clearInterval(interval);
        setHoverState((prev) => {
          const updated = [...prev];
          updated[index] = false;
          return updated;
        });
      } else {
        iteration++;
      }
    }, 50);
  };

  return (
    <AnimatePresence>
      {isOpenMenu && (
        <motion.div
          className="backdrop-blur-xl bg-white/20 filter-bar fixed right-0 h-screen overflow-y-auto w-full md:w-[500px] z-[40]"
          initial={{ translateX: "100%" }}
          animate={{ translateX: "0%" }}
          exit={{ translateX: "100%" }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
        >
          <div className="flex flex-col gap-8 pt-20 px-8 sm:px-12">
            <div className={`flex flex-col font-bold text-white text-md sm:text-xl ${opinionPro.className}`}>
              <button className={`py-4 text-left ${pathname === "/home" ?
                "text-yellow-400 hover:text-yellow-300"
                : "hover:text-white"
                }`}
                onClick={() => {
                  if (pathname === "/home") return;
                  dispatch(setJumpPage(true));
                  const timeout = setTimeout(() => {
                    router.push(`/home`);
                  }, 200);
                  return () => clearTimeout(timeout);
                }}
                onMouseEnter={() => handleMouseEnter(0, "Home")}>
                {menuText[0] || "Home"}
              </button>
              <Divider />
              <Collapse
                ghost
                expandIcon={({ isActive }) => (
                  <IoIosArrowForward
                    style={{ color: "white", fontSize: "1.5rem" }}
                    className={`transition-transform duration-300 ${isActive ? "rotate-90" : "-rotate-90"}`}
                  />
                )}
                expandIconPosition={"end"}
                style={{ padding: "16px 0" }}
                items={[
                  {
                    key: "1",
                    label: (
                      <div
                        onMouseEnter={() => handleMouseEnter(1, "TN7 Universe")}
                        className={`target text-white text-md sm:text-xl ${opinionPro.className}`}
                      >
                        {menuText[1] || "TN7 Universe"}
                      </div>
                    ),
                    children: (
                      <div className={`flex flex-col pl-4 text-md sm:text-xl text-white ${opinionPro.className}`}>
                        <button
                          className={`pb-4 text-left ${pathname === "/comics"
                            ? "text-yellow-400 hover:text-yellow-300"
                            : "hover:text-white"
                            }`}
                          onClick={() => {
                            if (pathname === "/comics") return;
                            dispatch(setJumpPage(true));
                            const timeout = setTimeout(() => {
                              router.push(`/comics`);
                            }, 200);
                            return () => clearTimeout(timeout);
                          }}
                          onMouseEnter={() => handleMouseEnter(2, "Comic")}
                        >
                          {menuText[2] || "Comic"}
                        </button>
                        <Divider />
                        <button
                          className={`py-4 text-left ${pathname === "/lore"
                            ? "text-yellow-400 hover:text-yellow-300"
                            : "hover:text-white"
                            }`}
                          onClick={() => {
                            if (pathname === "/lore") return;
                            dispatch(setJumpPage(true));
                            const timeout = setTimeout(() => {
                              router.push(`/lore`);
                            }, 200);
                            return () => clearTimeout(timeout);
                          }}
                          onMouseEnter={() => handleMouseEnter(3, "Lore")}
                        >
                          {menuText[3] || "Lore"}
                        </button>
                        <Divider />
                        <button
                          className={`py-4 text-left ${pathname === "/worldmap"
                            ? "text-yellow-400 hover:text-yellow-300"
                            : "hover:text-white"
                            }`}
                          onClick={() => {
                            if (pathname === "/worldmap") return;
                            dispatch(setJumpPage(true));
                            const timeout = setTimeout(() => {
                              router.push(`/worldmap`);
                            }, 200);
                            return () => clearTimeout(timeout);
                          }}
                          onMouseEnter={() => handleMouseEnter(4, "World Map")}
                        >
                          {menuText[4] || "World Map"}
                        </button>
                        <Divider />
                        <button
                          className={`py-4 text-left ${pathname === "/videos"
                            ? "text-yellow-400 hover:text-yellow-300"
                            : "hover:text-white"
                            }`}
                          onClick={() => {
                            if (pathname === "/video") return;
                            dispatch(setJumpPage(true));
                            const timeout = setTimeout(() => {
                              router.push(`/video`);
                            }, 200);
                            return () => clearTimeout(timeout);
                          }}
                          onMouseEnter={() => handleMouseEnter(5, "Videos")}
                        >
                          {menuText[5] || "Videos"}
                        </button>
                        <Divider />
                        <button
                          className={`py-4 text-left ${pathname === "/entry"
                            ? "text-yellow-400 hover:text-yellow-300"
                            : "hover:text-white"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          onClick={() => {
                            if (pathname === "/entry") return;
                            dispatch(setJumpPage(true));
                            const timeout = setTimeout(() => {
                              router.push(`/entry/public/story`);
                            }, 200);
                            return () => clearTimeout(timeout);
                          }}
                          onMouseEnter={() => handleMouseEnter(6, "Public Entries")}
                          disabled
                        >
                          {menuText[6] || "Public Entries"}
                        </button>
                        <Divider />
                        <button
                          className={`pt-4 text-left ${pathname === "/citizen"
                            ? "text-yellow-400 hover:text-yellow-300"
                            : "hover:text-white"
                            }`}
                          onClick={() => {
                            if (pathname === "/citizen") return;
                            dispatch(setJumpPage(true));
                            const timeout = setTimeout(() => {
                              router.push(`/citizen`);
                            }, 200);
                            return () => clearTimeout(timeout);
                          }}
                          onMouseEnter={() => handleMouseEnter(7, "Citizens")}
                        >
                          {menuText[7] || "Citizens"}
                        </button>
                      </div>
                    )
                  }
                ]}
              />
              <Divider />
              <Collapse
                ghost
                expandIcon={({ isActive }) => (
                  <IoIosArrowForward
                    style={{ color: "white", fontSize: "1.5rem" }}
                    className={`transition-transform duration-300 ${isActive ? "rotate-90" : "-rotate-90"}`}
                  />
                )}
                expandIconPosition={"end"}
                style={{ padding: "16px 0" }}
                items={[
                  {
                    key: "2",
                    label: (
                      <div
                        onMouseEnter={() => handleMouseEnter(5, "Socials")}
                        className={`target text-white text-md sm:text-xl ${opinionPro.className}`}
                      >
                        {menuText[8] || "Socials"}
                      </div>
                    ),
                    children: (
                      <div className={`flex flex-col pl-4 text-md sm:text-xl text-white ${opinionPro.className}`}>
                        <a href="https://x.com/tn7_viu" target="_blank" className="flex gap-2 items-center pb-4 hover:text-white" onMouseEnter={() => handleMouseEnter(9, "X")}><BsTwitterX /> {menuText[9] || "X"}</a>
                        <Divider />
                        <a href="https://discord.gg/ynEgRUF2UA" target="_blank" className="flex gap-2 items-center py-4 hover:text-white" onMouseEnter={() => handleMouseEnter(10, "Discord")}><BsDiscord /> {menuText[10] || "Discord"}</a>
                        <Divider />
                        <a href="https://www.instagram.com/tn7_viu" target="_blank" className="flex gap-2 items-center pt-4 hover:text-white" onMouseEnter={() => handleMouseEnter(11, "Instagram")}><BsInstagram /> {menuText[11] || "Instagram"}</a>
                      </div>
                    )
                  }
                ]}
              />
              <Divider />
              <button className={`py-4 text-left ${pathname === "/discovermore" ?
                "text-yellow-400 hover:text-yellow-300" :
                "hover:text-white"
                }`}
                onClick={() => {
                  if (pathname === "/discovermore") return;
                  dispatch(setJumpPage(true));
                  const timeout = setTimeout(() => {
                    router.push(`/discovermore`);
                  }, 200);
                  return () => clearTimeout(timeout);
                }}
                onMouseEnter={() => handleMouseEnter(12, "Discover More")}
              >
                {menuText[12] || "Discover More"}
              </button>
              <Divider />
            </div>
            <div className={`flex flex-col text-sm ${opinionPro.className}`}>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (pathname === "/termsofuse") return;
                    //dispatch(setJumpPage(true));
                    //const timeout = setTimeout(() => {
                    //router.push(`/termsofuse`);
                    //}, 200);
                    //return () => clearTimeout(timeout);
                    window.open('/termsofuse.html', '_blank', 'noopener,noreferrer');
                  }}
                  className="duration-300 hover:opacity-50">TERMS OF USE</button> |
                <button
                  onClick={() => {
                    if (pathname === "/privacy") return;
                    //dispatch(setJumpPage(true));
                    //const timeout = setTimeout(() => {
                    //router.push(`/privacy`);
                    //}, 200);
                    //return () => clearTimeout(timeout);
                    window.open('/privacy.html', '_blank', 'noopener,noreferrer');
                  }}
                  className="duration-300 hover:opacity-50">PRIVACY NOTICE</button>
              </div>
              <div>TN7 © 2024 - 2025</div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Header = ({ setIsOpenMenuParent, isOpenMenuParent }: { setIsOpenMenuParent?: (state: boolean) => void, isOpenMenuParent?: boolean }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpenMenu, setIsOpenMenu] = useState<boolean>(false);
  const { isConnected, address, isConnecting } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const { signMessageAsync } = useSignMessage();
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, user, walletLogin, logout } = useAuth({ type: "user" });
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const jumpPage = useSelector((state: RootState) => state.page.jumpPage);

  // 自动签名登录（排除登录和注册页面，这些页面会自己处理）
  useEffect(() => {
    if (isConnected && !isAuthenticated && !isLoading && mounted && pathname !== '/login' && pathname !== '/register') {
      handleWalletLogin();
    }
    // eslint-disable-next-line
  }, [isConnected, isAuthenticated, isLoading, mounted, pathname]);

  //handle hydration error
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleWalletLogin = async () => {
    if (!isConnected || !address) {
      alert('Please connect wallet first!');
      return;
    }

    try {
      setIsLoading(true);
      const message = 'Sign to login to NFT Website!';
      const signature = await signMessageAsync({ message });

      const response = await walletLogin(address, signature);
      if (!response?.completed) {
        dispatch(setJumpPage(true));
        const timeout = setTimeout(() => {
          router.push(`/profile/setup`);
        }, 200);
        return () => clearTimeout(timeout);
      } else if(pathname === "/login" || pathname === "/register") {
        dispatch(setJumpPage(true));
        const timeout = setTimeout(() => {
          router.push('/home');
        }, 200);
        return () => clearTimeout(timeout);
      }
    } catch (error) {
      console.error('Login failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    disconnect();// 断开钱包连接
    dispatch(setJumpPage(true));
    const timeout = setTimeout(() => {
      router.push('/login');
    }, 200);
    return () => clearTimeout(timeout);
  };

  useEffect(() => {
    if (!showUserDropdown) return;

    function handleClickOutside(event: MouseEvent) {
      // @ts-ignore
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserDropdown]);

  useEffect(() => {
    if(jumpPage) {
      setIsOpenMenu(false);
    }
  }, [jumpPage]);

  useEffect(() => {
    console.log("isAuthenticated", isAuthenticated);
  }, [isAuthenticated]);

  return (<>
    <Image alt="logo"
      className="cursor-pointer target fixed left-8 top-0 w-20 sm:w-26 z-[100]"
      width={920} height={384} src={`/assets/images/TN7_Blurb.png`} priority quality={50}
      onClick={() => {
        if (pathname !== "/home") {
          dispatch(setJumpPage(true));
          const timeout = setTimeout(() => {
            router.push(`/home`);
          }, 200);
          return () => clearTimeout(timeout);
        }
      }}
    />
    <div className="fixed right-24 top-4 z-[100] flex gap-4">
      {/*!mounted ? (
        <div className="bg-white/20 backdrop-blur-sm text-white h-10 px-4 rounded-full sm:rounded-lg flex items-center justify-center gap-2">
          <Spin size="small" />
        </div>
      ) : !isConnected ? (
        <button
          onClick={openConnectModal}
          type="button"
          className="bg-white/20 backdrop-blur-sm text-white h-10 px-4 rounded-full sm:rounded-lg hover:bg-white/30 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <MdWallet className="text-2xl" />
          <span className="hidden sm:block">Connect Wallet</span>
          {isConnecting && <Spin size="small" />}
        </button>
      ) : (
        <button
          onClick={() => disconnect()}
          type="button"
          className="bg-white/20 backdrop-blur-xl text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-300"
        >
          {address?.slice(0, 6) + "..." + address?.slice(-4)}
        </button>
      )}*/}
      {/* 用户按钮 - 显示用户头像或默认图标 */}
      {isAuthenticated ? (
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            type="button"
            className="duration-300 flex items-center justify-center hover:bg-white/20 hover:opacity-80 rounded-full w-10 h-10 overflow-hidden hover:border-white/40 transition-all duration-300"
          >
            {user?.profile_picture ? (
              <Image
                alt="User Profile"
                className="w-full h-full object-cover"
                width={40}
                height={40}
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${user.profile_picture}`}
                priority
                quality={50}
              />) : (
              <FaRegUserCircle className="text-white text-4xl" />
            )}
          </button>
          <AnimatePresence>
            {showUserDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 5 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                ref={dropdownRef}
                className="absolute right-0 mt-2 w-48 bg-white/20 backdrop-blur-xl shadow-lg flex flex-col gap-2 rounded-lg"
              >
                <div className="absolute -top-2 right-3 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white/20" />
                <div className="flex flex-col gap-2 rounded-lg overflow-hidden">
                  <button onClick={() => {
                    if (pathname === `/dashboard/${user.id}`) return;
                    dispatch(setJumpPage(true));
                    const timeout = setTimeout(() => {
                      router.push(`/dashboard/${user.id}`);
                    }, 200);
                    return () => clearTimeout(timeout);
                  }} className="duration-300 flex items-center gap-2 w-full h-full text-white text-left px-4 py-2 hover:bg-white/30"><MdDashboard /> Go to Dashboard</button>
                  <button onClick={handleLogout} className="duration-300 flex items-center gap-2 w-full h-full text-white text-left px-4 py-2 hover:bg-white/30"><MdLogout /> Logout</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <button
          onClick={() => {
            dispatch(setJumpPage(true));
            const timeout = setTimeout(() => {
              const targetPath = pathname === "/login" ? "register" : "login";
              router.push(`/${targetPath}`);
            }, 200);
            return () => clearTimeout(timeout);
          }}
          type="button"
          className="bg-white/20 backdrop-blur-sm text-white h-10 px-4 rounded-full sm:rounded-lg hover:bg-white/30 transition-all duration-300 flex items-center justify-center gap-2"
        >
          {pathname === "/login" ? "REGISTER" : "LOGIN"}
        </button>
      )}
      <button
        onClick={() => router.push('/notification')}
        type="button"
        className="duration-300 flex items-center justify-center hover:bg-white/20 hover:opacity-80 rounded-full w-10 h-10 text-white/70 text-2xl cursor-not-allowed"
      >
        <MdNotificationsOff />
      </button>
    </div>
    <button onClick={() => {
      setIsOpenMenu(!isOpenMenu);
      if (setIsOpenMenuParent) setIsOpenMenuParent(!isOpenMenuParent);
    }} className="fixed duration-300 h-[36px] right-8 hover:opacity-80 top-4 w-[36px] z-[100]">
      <div className="relative h-full w-full">
        <div className={`absolute bg-white duration-300 h-[4px] w-[36px] left-0 ${isOpenMenu ? "rotate-45 top-[16px]" : "rotate-0 top-[8px]"}`}></div>
        <div className={`absolute bg-white duration-300 h-[4px] left-0 ${isOpenMenu ? "rotate-[135deg] top-[16px] w-[36px] border-2" : "rotate-0 top-[24px] w-[28px]"}`}></div>
      </div>
    </button>
    <Suspense fallback={null}>
      <Sidebar isOpenMenu={isOpenMenu} />
    </Suspense>
  </>)
}

export default Header;

