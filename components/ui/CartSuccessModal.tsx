"use client";

import React from "react";
import { Dialog, DialogContent, Box, Typography, Button, IconButton } from "@mui/material";
import { CheckCircle, Close, ShoppingCart } from "@mui/icons-material";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

interface CartSuccessModalProps {
  open: boolean;
  onClose: () => void;
  productName?: string;
}

export default function CartSuccessModal({ 
  open, 
  onClose, 
  productName
}: CartSuccessModalProps) {
  const { getTotalItems } = useCart();
  const router = useRouter();

  const handleViewCart = () => {
    router.push("/basket");
    onClose();
  };

  const handleContinueShopping = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: "16px",
          padding: "24px",
        },
      }}
    >
      <DialogContent sx={{ textAlign: "center", p: 3 }}>
        {/* Close button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            color: "#666",
          }}
        >
          <Close />
        </IconButton>

        {/* Success icon */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 3,
          }}
        >
          <CheckCircle
            sx={{
              fontSize: 64,
              color: "#4CAF50",
            }}
          />
        </Box>

        {/* Success message */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
            color: "#008c99",
            mb: 2,
          }}
        >
          Товар додано до кошика!
        </Typography>

        {/* Product info */}
        {productName && (
          <Typography
            variant="body1"
            sx={{
              color: "#666",
              mb: 3,
            }}
          >
            {productName}
          </Typography>
        )}

        {/* Cart total */}
        <Box
          sx={{
            backgroundColor: "#f5f5f5",
            borderRadius: "8px",
            padding: "16px",
            mb: 3,
          }}
        >
          <Typography variant="body2" color="#666" sx={{ mb: 1 }}>
            Всього товарів у кошику:
          </Typography>
          <Typography variant="h6" sx={{ color: "#008c99", fontWeight: "bold" }}>
            {getTotalItems()} шт.
          </Typography>
        </Box>

        {/* Action buttons */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: "center",
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <Button
            variant="outlined"
            onClick={handleContinueShopping}
            sx={{
              borderColor: "#008c99",
              color: "#008c99",
              "&:hover": {
                borderColor: "#147a86",
                backgroundColor: "rgba(0, 140, 153, 0.1)",
              },
              minWidth: 140,
            }}
          >
            Продовжити покупки
          </Button>
          <Button
            variant="contained"
            onClick={handleViewCart}
            startIcon={<ShoppingCart />}
            sx={{
              backgroundColor: "#008c99",
              "&:hover": {
                backgroundColor: "#147a86",
              },
              minWidth: 140,
            }}
          >
            Перейти до кошика
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
