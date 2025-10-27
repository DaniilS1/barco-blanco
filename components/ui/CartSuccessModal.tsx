"use client";

import React from "react";
import { Dialog, DialogContent, Box, Typography, Button, IconButton } from "@mui/material";
import { Close, ShoppingCart } from "@mui/icons-material";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

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
          padding: "18px",
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

         {/* Success Icon */}
         <div className="flex justify-center mb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", duration: 0.6 }}
                  className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center"
                >
                  <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-500" />
                </motion.div>
              </div>

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
