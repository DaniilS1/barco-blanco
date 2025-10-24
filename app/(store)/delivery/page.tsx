// app/(store)/delivery/page.tsx
"use client";

import React from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PaymentIcon from "@mui/icons-material/Payment";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import "@/app/globals.css";

const AccentColor = "#008c99";

const Root = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(8),
  maxWidth: "xl",
}));

const Hero = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(3),
  alignItems: "center",
  justifyContent: "space-between",
  background: "transparent",
  borderRadius: 12,
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  flexDirection: "column",
  [theme.breakpoints.up("md")]: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
}));

const FeatureCard = styled(Card)(() => ({
  borderRadius: 12,
  boxShadow: "0 8px 30px rgba(22,56,60,0.06)",
  height: "100%",
  display: "flex",
  flexDirection: "column",
}));

const Small = styled(Typography)({
  fontSize: 14,
  color: "text.secondary",
});

export default function Delivery() {
  return (
    <Root>
      <Hero>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{ color: AccentColor, fontWeight: 800, mb: 1, fontSize: { xs: 20, md: 28 } }}
          >
            Доставка та оплата
          </Typography>

          <Typography sx={{ fontSize: { xs: 14, md: 16 }, color: "text.secondary", mb: 2, maxWidth: 820 }}>
            Ми пропонуємо швидку та зручну доставку по всій Україні. Ви можете обрати найбільш зручний спосіб доставки під час оформлення замовлення.
            Оплата — по домовленості. Якщо у вас є питання, зв&apos;яжіться з нами телефоном або поштою.
          </Typography>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 2 }}>
            <Button
              component="a"
              href="/products"
              variant="contained"
              sx={{
                bgcolor: AccentColor,
                "&:hover": { bgcolor: "#007d87" },
                fontWeight: 700,
                px: 3,
              }}
            >
              Перейти в каталог
            </Button>

            <Button
              component="a"
              href="tel:+380504730644"
              variant="outlined"
              startIcon={<PhoneIcon />}
              sx={{ borderColor: AccentColor, color: AccentColor }}
            >
              Зателефонувати
            </Button>
          </Box>
        </Box>
      </Hero>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <FeatureCard>
            <CardContent sx={{ flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PaymentIcon sx={{ color: AccentColor, fontSize: 28 }} />
                <Typography sx={{ fontWeight: 700 }}>Оплата</Typography>
              </Box>

              <Small sx={{ mt: 1 }}>
                Оплата — по домовленості. Нижче наведені типові варіанти; остаточний спосіб узгоджується при оформленні або по телефону.
              </Small>

              <List>
                <ListItem>
                  <ListItemIcon>
                    <PaymentIcon sx={{ color: AccentColor }} />
                  </ListItemIcon>
                  <ListItemText primary="Готівка при отриманні (кур&apos;єру або при самовивозі)" />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <PaymentIcon sx={{ color: AccentColor }} />
                  </ListItemIcon>
                  <ListItemText primary="Переказ на картку або реквізити (за домовленістю)" />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <PaymentIcon sx={{ color: AccentColor }} />
                  </ListItemIcon>
                  <ListItemText primary="Безготівковий розрахунок для юридичних осіб (ми виставляємо рахунок)" />
                </ListItem>
              </List>

              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Узгоджуйте спосіб оплати під час оформлення замовлення або за телефоном: +38 (050) 47-30-644
                </Typography>
              </Box>
            </CardContent>
          </FeatureCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <FeatureCard>
            <CardContent sx={{ flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LocalShippingIcon sx={{ color: AccentColor, fontSize: 28 }} />
                <Typography sx={{ fontWeight: 700 }}>Доставка</Typography>
              </Box>

              <Small sx={{ mt: 1 }}>
                Доставка по місту, через сервіс Нова Пошта або інші варіанти за домовленістю.
              </Small>

              <List>
                <ListItem>
                  <ListItemIcon>
                    <LocalShippingIcon sx={{ color: AccentColor }} />
                  </ListItemIcon>
                  <ListItemText primary="Доставка по місту" />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <LocalShippingIcon sx={{ color: AccentColor }} />
                  </ListItemIcon>
                  <ListItemText primary="Нова Пошта (відділення)" />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <LocalShippingIcon sx={{ color: AccentColor }} />
                  </ListItemIcon>
                  <ListItemText primary="Інші варіанти — за домовленістю" />
                </ListItem>
              </List>
            </CardContent>
          </FeatureCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <FeatureCard>
            <CardContent sx={{ flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <SupportAgentIcon sx={{ color: AccentColor, fontSize: 28 }} />
                <Typography sx={{ fontWeight: 700 }}>Підтримка</Typography>
              </Box>

              <Small sx={{ mt: 1 }}>
                Якщо у вас виникли додаткові запитання, зв&apos;яжіться з нами за телефоном або надішліть листа.
              </Small>

              <Divider sx={{ my: 1 }} />

              <List>
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon sx={{ color: AccentColor }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <a href="tel:+380504730644" style={{ textDecoration: "none", color: "inherit" }}>
                        +38 (050) 47-30-644
                      </a>
                    }
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <EmailIcon sx={{ color: AccentColor }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <a href="mailto:avsdom@ukr.net" style={{ textDecoration: "none", color: "inherit" }}>
                        avsdom@ukr.net
                      </a>
                    }
                  />
                </ListItem>
              </List>

              <Box sx={{ mt: 2 }}>
                <Button component="a" href="mailto:avsdom@ukr.net" fullWidth variant="contained" sx={{ bgcolor: AccentColor, "&:hover": { bgcolor: "#007d87" } }}>
                  Написати нам
                </Button>
              </Box>
            </CardContent>
          </FeatureCard>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          Часті питання
        </Typography>

        <Box sx={{ bgcolor: "#fff", borderRadius: 8, p: 3, boxShadow: "0 8px 30px rgba(22,56,60,0.04)" }}>
          <Typography sx={{ mb: 1, fontWeight: 600 }}>Чи можна обрати іншу службу доставки?</Typography>
          <Small>
            Так — якщо ви хочете іншу службу доставки (наприклад, кур&apos;єрську компанію), уточніть при оформленні замовлення або зателефонуйте нам.
          </Small>

          <Divider sx={{ my: 2 }} />

          <Typography sx={{ mb: 1, fontWeight: 600 }}>Скільки часу триває доставка?</Typography>
          <Small>Залежить від регіону і обраної служби. Зазвичай 1–5 робочих днів по Україні.</Small>
        </Box>
      </Box>

      <Box sx={{ mt: 5, textAlign: "center" }}>
        <Typography sx={{ color: "text.secondary", mb: 2 }}>
          Потрібна допомога з оплатою або доставкою? Ми поруч.
        </Typography>
        <Button component="a" href="tel:+380504730644" variant="contained" sx={{ bgcolor: AccentColor, "&:hover": { bgcolor: "#007d87" }, fontWeight: 700 }}>
          Зателефонувати +38 (050) 47-30-644
        </Button>
      </Box>
    </Root>
  );
}
