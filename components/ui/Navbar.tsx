"use client";

import Link from "next/link";
import React, { FC, useState, useEffect, useRef, KeyboardEvent } from "react";
import { styled } from "@mui/material/styles";
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Typography,
  InputBase,
  Badge,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  useMediaQuery,
  Paper,
  SwipeableDrawer, // <-- SwipeableDrawer instead of Drawer
} from "@mui/material";

import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

const SearchContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  borderRadius: "20px",
  backgroundColor: "transparent",
  border: "1px solid #008c99",
  display: "flex",
  alignItems: "center",
  padding: "4px 8px",
  margin: "0 30px",

  [theme.breakpoints.down("sm")]: {
    height: "35px",
    margin: "0 10px",
    padding: "0px 6px",
  },
}));

const SearchIconWrapper = styled("div")({
  color: "#008c99",
  marginRight: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "#008c99",
  flexGrow: 1,
  border: "none",
  outline: "none",
  fontSize: "16px",
  backgroundColor: "transparent",
  "& .MuiInputBase-input": {
    padding: "8px",
    width: "100%",
    [theme.breakpoints.down(468)]: {
      padding: "4px",
      fontSize: "14px",
    },
  },
}));

const SuggestionsContainer = styled(Paper)({
  position: "absolute",
  top: "100%",
  left: 0,
  right: 0,
  zIndex: 9999,
  maxHeight: "200px",
  overflowY: "auto",
  backgroundColor: "#ffffff",
  border: "1px solid #ccc",
  marginTop: "4px",
});

const HoverLink = styled(Typography)({
  cursor: "pointer",
  color: "#fff",
  margin: "0 1rem",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    transform: "scale(1.05)",
    color: "#e0f7ff",
  },
});

const BurgerMenuHeader = styled("div")({
  display: "flex",
  alignItems: "center",
  padding: "16px",
  backgroundColor: "#f5f5f5",
  borderBottom: "1px solid #ddd",
});

const BurgerMenuContainer = styled(Box)({
  width: 250,
  backgroundColor: "#f5f5f5",
  height: "100%",
  display: "flex",
  flexDirection: "column",
});

const Navbar: FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState<
    { name: string; slug: string }[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { getTotalItems } = useCart();

  const isMobile = useMediaQuery("(max-width: 600px)");
  const isVeryNarrow = useMediaQuery("(max-width: 468px)");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      // Sanfterer Übergang mit einem größeren Bereich
      setIsScrolled(scrollTop > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Prevent body scroll when mobile search modal is open
    if (mobileSearchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileSearchOpen]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchValue.trim()) return setSuggestions([]);
      try {
        const res = await fetch(
          `/api/search?query=${encodeURIComponent(searchValue)}`
        );
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
        }
      } catch (error) {
        console.error("Search error:", error);
      }
    };
    fetchSuggestions();
  }, [searchValue]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && suggestions.length > 0) {
      router.push(`/productDetails/${suggestions[0].slug}`);
      setSearchValue("");
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (slug: string) => {
    router.push(`/productDetails/${slug}`);
    setSearchValue("");
    setSuggestions([]);
    setShowSuggestions(false);
    setMobileSearchOpen(false);
  };

  const handleMobileSearchClose = () => {
    setMobileSearchOpen(false);
    setSearchValue("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleMobileSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      handleMobileSearchClose();
    }
    if (e.key === "Enter" && suggestions.length > 0) {
      router.push(`/productDetails/${suggestions[0].slug}`);
      handleMobileSearchClose();
    }
  };

  return (
    <>
      {/* Desktop Menu (hidden on mobile) */}
      {!isMobile && (
        <Box
          sx={{
            backgroundColor: "#008c99",
            display: "flex",
            justifyContent: "center",
            padding: isScrolled ? "0.25rem 0" : "0.5rem 0",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            position: isScrolled ? "fixed" : "static",
            top: isScrolled ? "0" : "auto",
            left: "0",
            right: "0",
            zIndex: 1001,
            opacity: isScrolled ? 0.95 : 1,
            backdropFilter: isScrolled ? "blur(8px)" : "none",
            boxShadow: isScrolled ? "0 2px 12px rgba(0, 0, 0, 0.1)" : "none",
          }}
        >
          <Link href="/" passHref>
            <HoverLink>Головна</HoverLink>
          </Link>
          <Link href="/products" passHref>
            <HoverLink>Каталог</HoverLink>
          </Link>
          <Link href="/guarantee" passHref>
            <HoverLink>Гарантія</HoverLink>
          </Link>
          <Link href="/delivery" passHref>
            <HoverLink>Доставка та оплата</HoverLink>
          </Link>
          <Link href="/contacts" passHref>
            <HoverLink>Контакти</HoverLink>
          </Link>
        </Box>
      )}

      {/* Mobile Swipeable Drawer */}
      <SwipeableDrawer
        anchor="left"
        open={drawerOpen}
        onOpen={() => setDrawerOpen(true)}
        onClose={() => setDrawerOpen(false)}
      >
        <BurgerMenuContainer>
          <Link href="/">
            <BurgerMenuHeader>
              <Box
                component="img"
                src="/icons/logo.svg"
                alt="logo"
                sx={{ width: 150, height: 50 }}
              />
            </BurgerMenuHeader>
          </Link>
          <Divider />
          <List>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href="/products"
                onClick={() => setDrawerOpen(false)}
              >
                <ListItemText
                  primary="Каталог"
                  primaryTypographyProps={{
                    fontWeight: "bold",
                    fontSize: 20,
                    color: "#008c99",
                  }}
                />
              </ListItemButton>
            </ListItem>
            {[
              { text: "Дзеркала", href: "/category/dzerkala" },
              { text: "Тумби", href: "/category/tumby" },
              { text: "Пенали", href: "/category/penaly" },
              { text: "Нависні шафи", href: "/category/shafy" },
              { text: "Водонепроникні", href: "/category/vologostiike" },
            ].map((item) => (
              <ListItem key={item.href} disablePadding>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  onClick={() => setDrawerOpen(false)}
                >
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            {[
              { text: "Головна", href: "/" },
              { text: "Каталог", href: "/products" },
              { text: "Гарантія", href: "/guarantee" },
              { text: "Доставка та оплата", href: "/delivery" },
              { text: "Контакти", href: "/contacts" },
            ].map((item) => (
              <ListItem key={item.href} disablePadding>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  onClick={() => setDrawerOpen(false)}
                >
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href="/basket"
                onClick={() => setDrawerOpen(false)}
              >
                <ListItemText
                  primary="Кошик"
                  primaryTypographyProps={{
                    fontWeight: "bold",
                    fontSize: 20,
                    color: "#008c99",
                  }}
                />
              </ListItemButton>
            </ListItem>
          </List>
        </BurgerMenuContainer>
      </SwipeableDrawer>

      {/* Main Navbar */}
      <AppBar
        position={isScrolled ? "fixed" : "static"}
        elevation={0}
        sx={{ 
          backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.95)" : "transparent", 
          pt: isScrolled ? (!isMobile ? "40px" : "10px") : "10px",
          backdropFilter: isScrolled ? "blur(12px)" : "none",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 1000,
          boxShadow: isScrolled ? "0 4px 20px rgba(0, 0, 0, 0.08)" : "none",
          borderBottom: isScrolled ? "1px solid rgba(0, 140, 153, 0.1)" : "none",
        }}
      >
        <Toolbar
          sx={{
            marginTop: "-10px",
            minHeight: isScrolled ? 60 : 60,
            maxWidth: "1400px",
            width: "100%",
            mx: "auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "nowrap",
            gap: {
              xs: 1,
              sm: 2,
              md: 4,
            },
            px: {
              xs: 1,
              sm: 2,
            },
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {/* Left Section: Menu Icon + Logo */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: {
                xs: 1,
                sm: 2,
              },
            }}
          >
            <IconButton
              sx={{ color: "#008c99" }}
              onClick={() => setDrawerOpen(true)}
            >
              <MenuOutlinedIcon
                sx={{
                  fontSize: {
                    xs: "1.8rem",
                    sm: "2rem",
                  },
                }}
              />
            </IconButton>
            <Link href="/">
              <Box
                component="img"
                src="/icons/logo.svg"
                alt="Logo"
                sx={{
                  height: 40,
                  cursor: "pointer",
                }}
              />
            </Link>
          </Box>

          {/* Search Bar - Desktop only */}
          {!isMobile && (
            <Box ref={containerRef} sx={{ position: "relative", flex: 1 }}>
              <SearchContainer>
                <SearchIconWrapper>
                  <SearchIcon
                    sx={{
                      fontSize: {
                        xs: "1.3rem",
                        sm: "1.rem",
                      },
                    }}
                  />
                </SearchIconWrapper>

                <StyledInputBase
                  placeholder={isVeryNarrow ? "" : "Пошук"}
                  value={searchValue}
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setShowSuggestions(true)}
                />
              </SearchContainer>
              {showSuggestions && suggestions.length > 0 && (
                <SuggestionsContainer>
                  {suggestions.map((item) => (
                    <ListItemButton
                      key={item.slug}
                      onClick={() => handleSuggestionClick(item.slug)}
                    >
                      <ListItemText primary={item.name} />
                    </ListItemButton>
                  ))}
                </SuggestionsContainer>
              )}
            </Box>
          )}

          {/* Right Section: Search Button (Mobile) + Shopping Cart */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: {
                xs: 1,
                sm: 2,
              },
            }}
          >
            {/* Mobile Search Button */}
            {isMobile && (
              <IconButton
                onClick={() => setMobileSearchOpen(true)}
                sx={{
                  color: "#008c99",
                  "&:hover": {
                    boxShadow: "none",
                    backgroundColor: "transparent",
                  },
                }}
              >
                <SearchIcon
                  sx={{
                    width: {
                      xs: 24,
                      sm: 28,
                    },
                    height: {
                      xs: 24,
                      sm: 28,
                    },
                  }}
                />
              </IconButton>
            )}

            <Link href="/basket">
              <IconButton
                disableRipple
                sx={{
                  color: "#008c99",
                  "&:hover": {
                    boxShadow: "none",
                    backgroundColor: "transparent",
                  },
                }}
              >
                <Badge
                  badgeContent={getTotalItems()}
                  sx={{
                    mr: 2,
                    "& .MuiBadge-badge": {
                      backgroundColor: "#008c99",
                      color: "#fff",
                      fontSize: {
                        xs: "0.8rem",
                        sm: "0.9rem",
                      },
                      minWidth: {
                        xs: 16,
                        sm: 20,
                      },
                      height: {
                        xs: 16,
                        sm: 20,
                      },
                    },
                  }}
                >
                  <ShoppingCartIcon
                    sx={{
                      width: {
                        xs: 24,
                        sm: 28,
                      },
                      height: {
                        xs: 24,
                        sm: 28,
                      },
                    }}
                  />
                </Badge>
              </IconButton>
            </Link>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Search Modal */}
      {mobileSearchOpen && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            animation: "fadeIn 0.3s ease-out",
          }}
          onClick={handleMobileSearchClose}
        >
          <Box
            sx={{
              backgroundColor: "white",
              width: "100%",
              padding: "25px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              animation: "slideDown 0.3s ease-out",
              borderBottomLeftRadius: "16px",
              borderBottomRightRadius: "16px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with close button */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6" sx={{ color: "#008c99", fontWeight: "bold" }}>
                Пошук товарів
              </Typography>
              <IconButton
                onClick={handleMobileSearchClose}
                sx={{
                  color: "#008c99",
                  "&:hover": {
                    backgroundColor: "rgba(0, 140, 153, 0.1)",
                  },
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </IconButton>
            </Box>

            {/* Search Input */}
            <Box sx={{ position: "relative" }}>
              <SearchContainer>
                <SearchIconWrapper>
                  <SearchIcon />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder="Пошук товарів..."
                  value={searchValue}
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onKeyDown={handleMobileSearchKeyDown}
                  onFocus={() => setShowSuggestions(true)}
                  autoFocus
                  sx={{
                    fontSize: "16px", // Prevents zoom on iOS
                  }}
                />
              </SearchContainer>

              {/* Mobile Search Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <SuggestionsContainer
                  sx={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    maxHeight: "300px",
                    overflowY: "auto",
                    marginTop: "8px",
                  }}
                >
                  {suggestions.map((item) => (
                    <ListItemButton
                      key={item.slug}
                      onClick={() => handleSuggestionClick(item.slug)}
                      sx={{
                        "&:hover": {
                          backgroundColor: "rgba(0, 140, 153, 0.1)",
                        },
                      }}
                    >
                      <ListItemText primary={item.name} />
                    </ListItemButton>
                  ))}
                </SuggestionsContainer>
              )}
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};

export default Navbar;