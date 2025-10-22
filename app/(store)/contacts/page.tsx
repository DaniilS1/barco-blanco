// app/(store)/contacts/page.tsx
"use client";
import React from "react";
import { Box, Typography, Link } from "@mui/material";
import Image from "next/image";
import "@/app/globals.css";

const Contacts = () => {
  return (
    <Box
      sx={{
        maxWidth: "1350px",
        margin: { xs: "20px auto", md: "20px auto" },
        px: { xs: "20px", md: "40px" },
        display: "flex",
        gap: { xs: "2rem", md: "3rem" },
        flexDirection: { xs: "column", md: "row" },
        alignItems: { xs: "center", md: "stretch" },
      }}
    >
      {/* Left Section - Image (hidden on small screens) */}
      <Box
        sx={{
          flex: 1,
          position: "relative",
          minHeight: "auto",
          borderRadius: "8px",
          overflow: "hidden",
          width: "100%",
          display: { xs: "none", md: "block" },
        }}
      >
        <Image
          src="/images/contact_photo.jpg"
          alt="Bathroom"
          fill
          style={{ objectFit: "cover" }}
        />
      </Box>

      {/* Right Section - Information */}
      <Box
        sx={{
          flex: 1,
          position: "relative",
          marginLeft: { md: "30px", xs: "0" },
          textAlign: { xs: "center", md: "left" },
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: "#008c99",
            fontWeight: "bold",
            mb: { xs: "20px", md: "50px" },
            alignSelf: { xs: "center", md: "flex-start" },
          }}
        >
          ГРАФІК РОБОТИ CALL-CENTER
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: { xs: "center", md: "flex-start" },
            gap: "20px",
            mb: { xs: "20px", md: "0" },
          }}
        >
          <Box>
            <Typography variant="body1" sx={{ fontSize: { xs: "20px", md: "24px" }, mb: "10px" }}>
              Вт-Нед:
            </Typography>
            <Typography variant="body1" sx={{ fontSize: { xs: "20px", md: "24px" } }}>
              Вихідний:
            </Typography>
          </Box>
          <Box>
            <Typography
              variant="body1"
              sx={{ fontSize: { xs: "20px", md: "24px" }, mb: "10px", color: "#008c99" }}
            >
              09:00 - 18:00
            </Typography>
            <Typography variant="body1" sx={{ fontSize: { xs: "20px", md: "24px" }, color: "#008c99" }}>
              Неділя
            </Typography>
          </Box>
        </Box>

        {/* Контактная информация */}
        <Box sx={{ my: { xs: "20px", md: "50px" } }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              alignItems: { xs: "center", md: "flex-start" },
            }}
          >
            <Typography
              variant="body1"
              component="a"
              href="tel:+380504730644"
              sx={{
                fontSize: { xs: "20px", md: "24px" },
                color: "#1996A3",
                transition: "transform 0.2s",
                "&:hover": { transform: "scale(1.1)" },
              }}
            >
              +38 (050) 47-30-644
            </Typography>

            <Typography
              variant="body1"
              component="a"
              href="mailto:avsdom@ukr.net"
              sx={{
                fontSize: { xs: "20px", md: "24px" },
                color: "#1996A3",
                transition: "transform 0.2s",
                "&:hover": { transform: "scale(1.1)" },
              }}
            >
              avsdom@ukr.net
            </Typography>
          </Box>
        </Box>

        {/* Divider */}
        <Box
          sx={{
            height: "2px",
            bgcolor: "#008c99",
            my: { xs: "20px", md: "50px" },
            width: "100%",
            maxWidth: { xs: "90%", md: "400px" },
            alignSelf: { xs: "center", md: "flex-start" },
          }}
        />

        <Typography variant="body1" sx={{ fontSize: "16px", mb: "1rem" }}>
          Слідкуйте за нами в соціальних мережах
        </Typography>

        {/* Social Media Links */}
        <Box
          sx={{
            display: "flex",
            gap: "40px",
            justifyContent: { xs: "center", md: "flex-start" },
            "& a": { transition: "transform 0.2s" },
            "& a:hover": { transform: "scale(1.1)" },
          }}
        >
          <Link href="https://www.instagram.com/barco_blanco__?igsh=c2d4MXpuOW5rNG9t" target="_blank" rel="noopener noreferrer">
            <Image src="/icons/instagram.png" alt="Instagram" width={50} height={50} />
          </Link>
          <Link href="https://t.me" target="_blank">
            <Image src="/icons/telegram.png" alt="Telegram" width={50} height={50} />
          </Link>
          <Link href="https://www.viber.com/ua/">
            <Image src="/icons/viber.png" alt="Viber" width={50} height={50} />
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default Contacts;

