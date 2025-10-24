"use client";
export const dynamic = "force-dynamic"; // Prevents static pre-rendering

import React from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import "@/app/globals.css";

const Root = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(8),
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  flexWrap: "wrap",
}));

const Card = styled(Box)(({ theme }) => ({
  background: "#fff",
  borderRadius: 12,
  padding: theme.spacing(3),
  boxShadow: "0 8px 30px rgba(22,56,60,0.08)",
  width: "100%",
}));

const Accent = { color: "#008c99", fontWeight: 700 };

const GuaranteeSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: 12,
  marginTop: theme.spacing(1),
  fontFamily: "Roboto, sans-serif",
  background: "linear-gradient(180deg, rgba(0,140,153,0.03), transparent)",
}));



const Guarantee = () => {
  return (
    // увеличить ширину контейнера на десктопах
    <Root maxWidth="lg" sx={{ maxWidth: { xl: 1400 } }}>
      <GuaranteeSection>
        <HeaderBox>
          <VerifiedUserIcon sx={{ fontSize: 40, color: "#008c99" }} />
          <Box>
            <Typography variant="h4" component="h1" sx={{ ...Accent, fontSize: { xs: 20, sm: 28 } }}>
              Гарантія на продукцію
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
              Ми відповідаємо за якість — гарантійний супровід і швидка підтримка.
            </Typography>
          </Box>
        </HeaderBox>

        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Card>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Що входить до гарантії
              </Typography>

              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutlineIcon sx={{ color: "#008c99" }} />
                  </ListItemIcon>
                  <ListItemText primary="Виробничі дефекти матеріалів та збірки" />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutlineIcon sx={{ color: "#008c99" }} />
                  </ListItemIcon>
                  <ListItemText primary="Проблеми з фурнітурою та кріпленнями" />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutlineIcon sx={{ color: "#008c99" }} />
                  </ListItemIcon>
                  <ListItemText primary="Підтримка при монтажі (за домовленістю)" />
                </ListItem>
              </List>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                Термін гарантії
              </Typography>
              <Typography variant="body1" paragraph sx={{ fontSize: 16 }}>
                Стандартний гарантійний термін —{" "}
                <span style={{ color: "#008c99", fontWeight: 800 }}>12 місяців</span> з моменту покупки.
              </Typography>

              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                Як оформити гарантію
              </Typography>
              <Typography variant="body1" paragraph sx={{ fontSize: 16 }}>
                1) Зберігайте чек або інший документ покупки. 2) Опишіть проблему (фото/відео допомагають). 3) Надішліть звернення — ми підкажемо подальші кроки.
              </Typography>

              <Box sx={{ display: "flex", gap: 2, mt: 1, flexWrap: "wrap" }}>
                <Button
                  component="a"
                  href="tel:+380504730644"
                  variant="contained"
                  startIcon={<PhoneIcon />}
                  sx={{ bgcolor: "#008c99", "&:hover": { bgcolor: "#007d87" } }}
                >
                  +38 (050) 47-30-644
                </Button>

                <Button
                  component="a"
                  href="mailto:avsdom@ukr.net"
                  variant="outlined"
                  startIcon={<EmailIcon />}
                  sx={{ borderColor: "#008c99", color: "#008c99" }}
                >
                  Написати на пошту
                </Button>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={5}>
            <Card>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Часті питання
              </Typography>

              <Accordion disableGutters>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: 600 }}>Які документи потрібні?</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2">
                    Чек або інвойс, опис проблеми, бажано фото/відео дефекту. Ми підкажемо, чи потрібно доставляти товар для огляду.
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion disableGutters>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: 600 }}>Скільки триває розгляд звернення?</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2">
                    Зазвичай ми відповідаємо протягом 48 годин з моменту отримання повного пакету інформації.
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion disableGutters>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: 600 }}>Чи покривається доставка?</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2">
                    У більшості випадків ремонт/заміну здійснюємо за власний рахунок, деталі обговорюються індивідуально.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </Card>

            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Маєте термінову проблему? Зателефонуйте — ми підкажемо перші кроки.
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Дякуємо, що обрали нашу продукцію. Ми з вами на зв&apos;язку.
          </Typography>
        </Box>
      </GuaranteeSection>
    </Root>
  );
};

export default Guarantee;

