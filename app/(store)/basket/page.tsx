"use client";
import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function BasketPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotalPrice } = useCart();
  const router = useRouter();

  const total = getCartTotalPrice();

  return (
    <div className="w-full max-w-[1400px] mx-auto py-6 px-4 sm:py-10">
      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center h-96">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Твій кошик пустий</h2>
          <p className="text-gray-600 mb-4">Додайте товари до кошика, щоб оформити замовлення.</p>
          <button
            onClick={() => router.push("/products")}
            className="px-6 py-3 bg-[#1996A3] text-white rounded-lg hover:bg-[#147A86] transition"
          >
            Перейти до каталогу
          </button>
        </div>
      ) : (
        <>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-6 text-center sm:text-left">
            Кошик{" "}
            <span className="text-[#1996A3] text-xl sm:text-2xl font-medium">
              {cart.length} товар{cart.length === 1 ? "" : cart.length < 5 ? "и" : "ів"}
            </span>
          </h1>

          <div className="hidden md:grid grid-cols-[1fr_150px_180px_150px_40px] gap-4 px-2 text-gray-500 font-semibold border-b pb-2 mb-4">
            <span>Найменування</span>
            <span className="text-right">Ціна</span>
            <span className="text-center">Кількість</span>
            <span className="text-right">Сума</span>
            <span></span>
          </div>

          <AnimatePresence>
            {cart.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="bg-white shadow-md rounded-xl px-4 py-6 md:py-4 grid grid-cols-1 md:grid-cols-[1fr_150px_180px_150px_40px] gap-4 mb-4 min-h-[140px] md:min-h-[120px] items-stretch"
              >
                <div className="flex flex-col md:flex-row gap-4 col-span-full md:col-span-1 h-full">
                  {/* изменено: добавил items-center и w-full */}
                  <div className="flex gap-4 items-center w-full">
                    {item.slug?.current ? (
                      <Link href={`/productDetails/${item.slug.current}`} className="shrink-0 block">
                        <Image
                          src={item.image}
                          width={80}
                          height={80}
                          alt={item.name}
                          className="object-cover rounded-md hover:opacity-80 transition-opacity cursor-pointer"
                        />
                      </Link>
                    ) : (
                      <Image
                        src={item.image}
                        width={80}
                        height={80}
                        alt={item.name}
                        className="object-cover rounded-md shrink-0"
                      />
                    )}
                    {/* изменено: центрируем контейнер и даем ему ширину */}
                    <div className="flex flex-col justify-center items-center h-full py-1 w-full">
                      {/* изменено: добавлен text-center - теперь видно на всех устройствах */}
                      {item.slug?.current ? (
                        <Link 
                          href={`/productDetails/${item.slug.current}`} 
                          className="w-full block hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors"
                        >
                          <h2 className="text-base sm:text-lg font-medium text-[#1996A3] leading-tight line-clamp-2 text-center hover:text-[#147A86] transition-colors cursor-pointer">
                            {item.name}
                          </h2>
                        </Link>
                      ) : (
                        <h2 className="text-base sm:text-lg font-medium text-[#1996A3] leading-tight line-clamp-2 text-center">
                          {item.name}
                        </h2>
                      )}

                      <div className="mt-2 space-y-2 text-sm text-gray-700 md:hidden">
                        <div className="flex justify-between w-[180px]">
                          <span className="text-gray-500">Ціна:</span>
                          <span className="text-[#1996A3] space-y-6 font-semibold">
                            {item.price.toLocaleString()} грн.
                          </span>
                        </div>
                        <div className="flex justify-between w-[180px]">
                          <span className="text-gray-500">Сума:</span>
                          <span className="font-semibold space-y-4 text-gray-700">
                            {(item.price * item.quantity).toLocaleString()} грн.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center gap-3 mt-4 md:hidden">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          item.quantity === 1
                            ? removeFromCart(item.id)
                            : updateQuantity(item.id, item.quantity - 1)
                        }
                        className="px-3 py-1 bg-[#1996A3] text-white rounded hover:bg-[#147A86] text-lg"
                      >
                        −
                      </button>
                      <span className="font-semibold space-y-10 space-x-10 ">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1 bg-[#1996A3] text-white rounded hover:bg-[#147A86] text-lg"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-[#147A86] transition"
                      title="Видалити товар"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="hidden md:flex items-center font-semibold text-[#1996A3] justify-end">
                  {item.price.toLocaleString()} грн.
                </div>

                <div className="hidden md:flex justify-center items-center gap-3">
                  <button
                    onClick={() =>
                      item.quantity === 1
                        ? removeFromCart(item.id)
                        : updateQuantity(item.id, item.quantity - 1)
                    }
                    className="px-3 py-1 bg-[#1996A3] text-white rounded hover:bg-[#147A86] text-lg"
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-3 py-1 bg-[#1996A3] text-white rounded hover:bg-[#147A86] text-lg"
                  >
                    +
                  </button>
                </div>

                <div className="hidden md:flex items-center justify-end font-semibold">
                  {(item.price * item.quantity).toLocaleString()} грн.
                </div>

                <div className="hidden md:flex justify-end items-center">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-400 hover:text-[#147A86] transition"
                    title="Видалити товар"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-wrap">
            <p className="text-lg sm:text-l font-bold text-gray-800">
              Загальна сума:{" "}
              <span className="text-[#1996A3] ">
                {total.toLocaleString()} грн.
              </span>
            </p>

            <div className="flex gap-3 flex-col sm:flex-row w-full sm:w-auto">
              <button
                onClick={clearCart}
                className="w-full sm:w-auto px-5 py-2 border border-[#1996A3] text-[#1996A3] rounded-lg hover:bg-[#1996A3] hover:text-white transition"
              >
                Очистити кошик
              </button>
              <button
                onClick={() => router.push("/order")}
                className="w-full sm:w-auto px-6 py-3 bg-[#1996A3] text-white rounded-lg hover:bg-[#147A86] transition font-semibold shadow-sm"
              >
                Продовжити замовлення
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}















