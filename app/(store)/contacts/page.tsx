// app/(store)/contacts/page.tsx
"use client";
import React from "react";
// удалил NextLink и IconButton (если больше нигде не используются)
import { Box, Typography, Container, Grid, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import Image from "next/image";
import "@/app/globals.css";

const Accent = "#008c99";

const Root = styled(Container)(() => ({
  maxWidth: 1400,
  paddingTop: 16, // можно заменить на число или использовать theme внутри, если нужен
  paddingBottom: 48,
  paddingLeft: 32,
  paddingRight: 32,
  "@media (max-width: 1200px)": {
    paddingLeft: 24,
    paddingRight: 24,
  },
  "@media (max-width: 600px)": {
    paddingTop: 12,
    paddingBottom: 32,
    paddingLeft: 16,
    paddingRight: 16,
  },
}));

const InfoCard = styled(Box)(({ theme }) => ({
  background: "#fff",
  borderRadius: 12,
  padding: theme.spacing(4),
  boxShadow: "0 10px 30px rgba(22,56,60,0.06)",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(3),
  },
}));

const HeaderBadge = styled(Box)(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: theme.spacing(1),
  padding: theme.spacing(0.5, 1),
  borderRadius: 999,
  background: "rgba(0,140,153,0.08)",
  color: Accent,
  fontWeight: 700,
}));

export default function Contacts() {
  return (
    <Root>
      <Grid container spacing={4} alignItems="stretch">
        <Grid item xs={12} md={6}>
          <InfoCard>
            <Box>
              <HeaderBadge>
                <AccessTimeIcon sx={{ fontSize: 18 }} /> ГРАФІК РОБОТИ CALL‑CENTER
              </HeaderBadge>

              <Typography variant="h5" sx={{ color: Accent, fontWeight: 800, mt: 2, mb: 1 }}>
                Ми на зв&apos;язку
              </Typography>

              <Box
                role="region"
                aria-label="Графік роботи"
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2,
                  mt: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    alignItems: "center",
                    bgcolor: "rgba(0,140,153,0.03)",
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  <AccessTimeIcon sx={{ color: Accent, fontSize: 28 }} />
                  <Box>
                    <Typography sx={{ fontSize: 13, color: "text.secondary", fontWeight: 700 }}>Пн–Пт</Typography>
                    <Typography sx={{ fontSize: { xs: 18, md: 22 }, fontWeight: 900, letterSpacing: 0.2 }}>
                      09:00 — 18:00
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    bgcolor: "transparent",
                    borderRadius: 2,
                    p: 2,
                    // mobile: row (one line); desktop (md+) — column (stacked)
                    flexDirection: { xs: "row", md: "column" },
                    alignItems: { xs: "center", md: "flex-start" },
                  }}
                >
                  <Typography sx={{ fontSize: 13, color: "text.secondary", fontWeight: 700, whiteSpace: { xs: "nowrap", md: "normal" } }}>
                    Вихідний
                  </Typography>

                  <Typography sx={{ fontSize: { xs: 18, md: 20 }, fontWeight: 800, color: "text.secondary", whiteSpace: { xs: "nowrap", md: "normal" } }}>
                    Неділя
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 3, display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
                <Button
                  component="a"
                  href="tel:+380504730644"
                  startIcon={<PhoneIcon />}
                  variant="contained"
                  sx={{
                    bgcolor: Accent,
                    "&:hover": { bgcolor: "#007d87" },
                    fontWeight: 700,
                    px: 3,
                    width: { xs: "100%", sm: "auto" },
                  }}
                >
                  +38 (050) 47-30-644
                </Button>

                <Button
                  component="a"
                  href="mailto:avsdom@ukr.net"
                  startIcon={<EmailIcon />}
                  variant="outlined"
                  sx={{
                    borderColor: Accent,
                    color: Accent,
                    fontWeight: 700,
                    width: { xs: "100%", sm: "auto" },
                  }}
                >
                  avsdom@ukr.net
                </Button>
              </Box>

              <Typography sx={{ mt: 3, color: "text.secondary" }}>
                Якщо у вас виникли додаткові запитання — зателефонуйте або напишіть, ми швидко допоможемо.
              </Typography>
            </Box>

            {/* Social links removed */}
          </InfoCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box
            sx={{
              borderRadius: 12,
              overflow: "hidden",
              height: { xs: 0, md: 420 }, // скрываем на мобильных, показываем на md+
              boxShadow: "0 10px 30px rgba(22,56,60,0.06)",
              position: "relative",
              background: "linear-gradient(180deg, rgba(0,140,153,0.04), rgba(0,140,153,0.02))",
              display: { xs: "none", md: "block" },
            }}
          >
            {/* decorative image — only visible on md+ */}
            <Box sx={{ position: "absolute", inset: 0 }}>
              <Image src="/images/contact_photo.jpg" alt="Contact" fill style={{ objectFit: "cover" }} />
            </Box>

            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.08) 40%, rgba(0,0,0,0.2) 100%)",
                display: "flex",
                alignItems: "flex-end",
                p: 3,
              }}
            >
              <Box sx={{ color: "#fff" }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Завжди раді допомогти
                </Typography>
                <Typography sx={{ fontSize: 14, opacity: 0.95 }}>Пишіть або телефонуйте — відповідаємо швидко</Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Root>
  );
}

