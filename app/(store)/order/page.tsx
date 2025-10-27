"use client";

import { useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Select from "react-select";
import * as z from "zod"
import logo from "../../../public/icons/nova_poshta_2014_logo.svg(1).png";
import pickupLogo from "../../../public/icons/pickup.png";

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import CreatableSelect from "react-select/creatable";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import PaymentMethod from "@/components/ui/PaymentMethod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useCart } from "@/context/CartContext"
import Image from "next/image"
import { Warehouse, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormProvider } from "react-hook-form";
import ErrorModal from "@/components/ui/ErrorModal";
import SuccessModal from "@/components/ui/SuccessModal";
import { toast } from "react-hot-toast";




type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

type DeliveryMethod = "nova-poshta" | "pickup" | string;

type OrderFormData = {
  // Kundeninfos
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Lieferinfos
  deliveryMethod: DeliveryMethod;        // Neue Methode zur Auswahl (z. B. Tabs, Accordion etc.)
  selectedToggle?: string;               // Відділення / Поштомат / Кур’єр

  city?: string;                         // Stadt (für NP/UP)
  warehouse?: string;                    // Відділення oder поштомат
  addressCourier?: string;              // Якщо доставка кур'єром
  // address поле удалено

  // Weitere Angaben
  additionalInfo?: string;
  paymentMethods: string;
  pickup?: string;
  pickupDeatails?: string;                       // Nur wenn pickup gewählt wird

  // Warenkorb
  cart: CartItem[];
};

type Warehouse = {
  Number: string,
  Description: string
};

const apiKey = process.env.NOVA_POSHTA_API_KEY;

const cities = [
  "Київ", "Харків", "Одеса", "Львів", "Дніпро", "Слов'янськ", "Запоріжжя", "Вінниця",
  "Івано-Франківськ", "Луцьк"
].map(city => ({ value: city, label: city }));


const formSchema = z
  .object({
    firstName: z.string().min(2, { message: "Введіть правильне ім'я." }),
    lastName: z.string().min(2, { message: "Введіть правильне прізвище." }),
    email: z.string().email({ message: "Некоректна електронна пошта." }),
    phone: z.string().min(10, { message: "Введіть правильний номер телефону." }),
    addressCourier: z.string().optional(),
    city: z.string().nullable().optional(),
    warehouse: z.string().optional(),
    additionalInfo: z.string().optional(),
    selectedToggle: z.string().optional(),
    paymentMethods: z.string().min(1, { message: "Оберіть метод оплати." }),
    pickup: z.string().optional(),
    pickupDeatails: z.string().optional(),
    deliveryMethod: z.enum(["nova-poshta", "pickup"], {
      required_error: "Оберіть спосіб доставки.",
    }),
  })
  .superRefine((data, ctx) => {
    if (data.deliveryMethod === "pickup") {
      // No additional validation needed for pickup
    } else if (data.deliveryMethod === "nova-poshta") {
      // Require selectedToggle for nova-poshta
      if (!data.selectedToggle) {
        ctx.addIssue({
          path: ["selectedToggle"],
          message: "Оберіть вид доставки.",
          code: z.ZodIssueCode.custom,
        });
      }

      if (!data.city || data.city.trim().length < 2) {
        ctx.addIssue({
          path: ["city"],
          message: "Оберіть або введіть місто.",
          code: z.ZodIssueCode.custom,
        });
      }

      if (data.selectedToggle === "courier") {
        if (!data.addressCourier || data.addressCourier.trim().length < 5) {
          ctx.addIssue({
            path: ["addressCourier"],
            message: "Введіть правильну адресу для кур'єра.",
            code: z.ZodIssueCode.custom,
          });
        }
      } else {
        if (!data.warehouse || data.warehouse.trim().length < 3) {
          ctx.addIssue({
            path: ["warehouse"],
            message: "Оберіть відділення або поштомат.",
            code: z.ZodIssueCode.custom,
          });
        }
      }
    }
  });


export default function OrderForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedToggle, setSelectedToggle] = useState("");
  const { cart, getCartTotalPrice, clearCart } = useCart();
  const [selectedCity, setSelectedCity] = useState<string>();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [open, setOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined);
  const [isResetting, setIsResetting] = useState(false);
  const [deliveryMethodError, setDeliveryMethodError] = useState(false);

  // Error Modal State
  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    errorType: "server" as "email" | "network" | "validation" | "server",
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      addressCourier: "",
      city: selectedCity || "",
      warehouse: "",
      additionalInfo: "",
      selectedToggle: "",
      // по умолчанию устанавливаем способ оплати, чтобы на проде/других устройствах он всегда отображался
      paymentMethods: "По домовленості",
      pickup: "",
      deliveryMethod: undefined,
      pickupDeatails: "",
    },
  });

  const router = useRouter();

  async function fetchWarehouses(city: string) {
    setLoadingWarehouses(true);
    try {
      const response = await fetch("https://api.novaposhta.ua/v2.0/json/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: apiKey,
          modelName: "Address",
          calledMethod: "getWarehouses",
          methodProperties: {
            CityName: city
          },
        }),
      });

      const data = await response.json();
      setWarehouses(data.data || []);
    } catch {
      setWarehouses([]);
    } finally {
      setLoadingWarehouses(false);
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Check for empty cart
    if (cart.length === 0) {
      toast.error('Додайте товари до кошика');
      return;
    }
    
    // Validate delivery method first
    if (!activeTab) {
      setDeliveryMethodError(true);
      toast.error('Оберіть спосіб доставки');
      // Scroll to delivery section
      const deliverySection = document.querySelector('[data-delivery-section]');
      if (deliverySection) {
        deliverySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    setDeliveryMethodError(false);
    setIsSubmitting(true);

    const deliveryMethod = values.deliveryMethod as DeliveryMethod;

    const cleanedOrder: OrderFormData = {
      ...values,
      deliveryMethod,
      city: undefined,
      warehouse: undefined,
      addressCourier: undefined,
      pickup: undefined,
      selectedToggle: selectedToggle,
      cart: cart?.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })) || []
    };

    // Setze je nach deliveryMethod passende Werte
    if (deliveryMethod === "pickup") {
      cleanedOrder.pickup = values.pickup;
    } else if (deliveryMethod === "nova-poshta" || deliveryMethod === "ukrposhta") {
      cleanedOrder.city = selectedCity ?? "";
      if (selectedToggle === "courier") {
        cleanedOrder.addressCourier = values.addressCourier;
      } else {
        cleanedOrder.warehouse = values.warehouse;
      }
    }


    try {
      const response = await fetch("/api/send_email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(cleanedOrder),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Check for specific error types
        if (response.status === 500) {
          // Email service error
          setErrorModal({
            isOpen: true,
            title: "Помилка поштового сервісу",
            message: errorData.details || "На жаль, поштовий сервіс тимчасово недоступний. Ваше замовлення не було відправлено. Будь ласка, спробуйте ще раз або зв'яжіться з нами телефоном.",
            errorType: "email",
          });
        } else if (response.status === 400) {
          // Validation error
          setErrorModal({
            isOpen: true,
            title: "Помилка валідації",
            message: errorData.error || "Перевірте правильність введених даних.",
            errorType: "validation",
          });
        } else {
          // General server error
          setErrorModal({
            isOpen: true,
            title: "Помилка сервера",
            message: "Виникла технічна помилка. Спробуйте ще раз через кілька хвилин.",
            errorType: "server",
          });
        }
        return;
      }

      // Success
      setIsResetting(true);
      setOpen(true);
      form.reset({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        addressCourier: "",
        city: "",
        warehouse: "",
        additionalInfo: "",
        selectedToggle: "",
        paymentMethods: "По домовленості",
        pickup: "",
        deliveryMethod: undefined,
        pickupDeatails: "",
      });
      setSelectedCity(undefined);
      setWarehouses([]);
      setSelectedToggle("");
      setActiveTab(undefined);
      localStorage.removeItem('orderFormData');
      clearCart();
      setTimeout(() => setIsResetting(false), 100);
    } catch (error) {
      // Network error or other unexpected error
      console.error("Order submission error:", error);
      setErrorModal({
        isOpen: true,
        title: "Помилка підключення",
        message: "Не вдалося з'єднатися з сервером. Перевірте ваше інтернет-з'єднання та спробуйте ще раз.",
        errorType: "network",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const totalPrice = getCartTotalPrice()

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Auto-save form data to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('orderFormData');
    if (saved && isClient) {
      try {
        const savedData = JSON.parse(saved);
        form.reset(savedData);
        if (savedData.city) setSelectedCity(savedData.city);
      } catch (error) {
        console.error('Error loading saved form data:', error);
      }
    }
  }, [isClient, form]);

  // Save form data on change
  useEffect(() => {
    if (!isClient || isResetting) return;

    const subscription = form.watch((value) => {
      localStorage.setItem('orderFormData', JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [form, isClient, isResetting]);

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 pt-6 pb-8 text-lg max-w-7xl mx-auto mt-0 px-0 overflow-hidden">
          {/* left column (формы) */}
          <Card className="border-none shadow-none outline-none ring-0 p-0 gap-0 max-w-full overflow-hidden">
            <CardContent>
              <Card className="shadow-md p-4 md:m-2 my-4 w-full">
                <CardHeader>
                  <CardTitle className="text-[#1996A3] text-[25px] font-semibold">
                    Контактні дані
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">

                  <FormField name="lastName" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        Прізвище <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Петренко" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField name="firstName" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        Ім&apos;я <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Іван" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField name="email" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        Електронна пошта <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="ivan@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField name="phone" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        Телефон <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="+38 (097) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                
                  <FormField name="additionalInfo" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Додаткова інформація</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Особливі побажання щодо доставки" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>
              <Card className="shadow-md p-4 md:m-2 my-4 w-full max-w-full overflow-hidden" data-delivery-section>
                <CardHeader>
                  <CardTitle className="text-[#1996A3] text-[20px] md:text-[25px] font-semibold">
                    Доставка 
                  </CardTitle>
                </CardHeader>
                <CardContent className="overflow-hidden">
                  <Tabs value={activeTab} onValueChange={(value) => {
                    setActiveTab(value);
                    form.setValue("deliveryMethod", value as "nova-poshta" | "pickup");
                    if (value === "pickup") {
                      setSelectedToggle("");
                      setSelectedCity("");
                      form.setValue("selectedToggle", "");
                      form.setValue("city", "");
                      form.setValue("warehouse", "");
                    } else if (value === "nova-poshta") {
                      // Auto-select "Відділення" as default
                      setSelectedToggle("Відділення");
                      form.setValue("selectedToggle", "Відділення");
                    }
                  }} className="w-full overflow-hidden">
                    <TabsList className={`flex flex-nowrap overflow-x-auto gap-2 w-full mb-2 ${
                      deliveryMethodError && !activeTab ? 'ring-2 ring-red-500' : ''
                    }`}>
                      <TabsTrigger value="nova-poshta"><Image src={logo} alt="Nova Poshta" className="w-3 h-auto mr-2" />Нова Пошта</TabsTrigger>
                      <TabsTrigger value="pickup"><Image src={pickupLogo} alt="Pickup" className="w-5 h-auto mr-2" />Самовивіз</TabsTrigger>
                    </TabsList>
                    {!activeTab && (
                      <div className="text-red-600 text-sm px-4 py-2 bg-red-50 border border-red-200 rounded-md">
                        Будь ласка, оберіть спосіб доставки
                      </div>
                    )}

                    {/* Нова Пошта */}
                    <TabsContent value="nova-poshta">
                      <div className="w-full overflow-hidden">
                        <div className="border-b-0 p-3 py-1 rounded-lg w-full overflow-hidden">
                          <div className="w-full overflow-hidden">
                            <div className="space-y-4 p-3 sm:p-5 rounded-lg text-sm sm:text-base w-full overflow-hidden">
                              {/* ToggleGroup (відділення / поштомат / кур'єр) */}
                              <ToggleGroup
                                type="single"
                                value={selectedToggle}
                                onValueChange={(value) => {
                                  setSelectedToggle(value);
                                  setSelectedCity("");
                                  form.setValue("city", "");
                                  form.setValue("warehouse", "");
                                }}
                                className="flex flex-wrap gap-2 sm:gap-3"
                              >
                                <ToggleGroupItem value="Відділення">🏢 Відділення</ToggleGroupItem>
                                <ToggleGroupItem value="Поштомат">📦 Поштомат</ToggleGroupItem>
                                <ToggleGroupItem value="courier">🚚 Кур&apos;єром</ToggleGroupItem>
                              </ToggleGroup>
                              {form.formState.errors.selectedToggle && (
                                <p className="text-sm font-medium text-red-500 mt-2">
                                  {form.formState.errors.selectedToggle.message}
                                </p>
                              )}

                              {/* Місто */}
                              <FormField name="city" render={() => (
                                <FormItem>
                                  <FormLabel>Місто</FormLabel>
                                  <FormControl>
                                    {isClient && (
                                      <CreatableSelect
                                        options={cities}
                                        value={selectedCity ? { value: selectedCity, label: selectedCity } : null}
                                        styles={{
                                          menu: (provided) => ({ ...provided, zIndex: 9999 }),
                                          container: (provided) => ({
                                            ...provided,
                                            width: "100%",
                                            maxWidth: "100%",
                                          }),
                                          control: (provided) => ({
                                            ...provided,
                                            width: "100%",
                                            maxWidth: "100%",
                                            minHeight: 42,
                                          }),
                                          input: (provided) => ({
                                            ...provided,
                                            fontSize: '16px', // Verhindert Auto-Zoom auf Mobile
                                          }),
                                          singleValue: (provided) => ({
                                            ...provided,
                                            fontSize: '16px',
                                          }),
                                          placeholder: (provided) => ({
                                            ...provided,
                                            fontSize: '16px',
                                          })
                                        }}
                                        menuPortalTarget={document.body}
                                        onChange={(city) => {
                                          if (city) {
                                            setSelectedCity(city.value);
                                            form.setValue("city", city.value);
                                            fetchWarehouses(city.value);
                                          }
                                        }}
                                        placeholder="Оберіть місто"
                                        isClearable
                                      />
                                    )}
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )} />

                              {/* Відділення або адреса */}
                              {selectedToggle !== "courier" ? (
                                <FormField name="warehouse" render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Відділення</FormLabel>
                                    <FormControl>
                                      {isClient && (
                                        <Select
                                          {...field}
                                          onChange={(selectedOption) => {
                                            field.onChange(selectedOption?.value);
                                            form.setValue("warehouse", selectedOption?.value || "");
                                          }}
                                          value={warehouses.find(w => w.Description === field.value) ? { value: field.value, label: field.value } : null}
                                          options={warehouses.map(w => ({ value: w.Description, label: w.Description }))}
                                          placeholder={loadingWarehouses ? "Завантаження..." : "Оберіть відділення"}
                                          isDisabled={!selectedCity || loadingWarehouses}
                                          isLoading={loadingWarehouses}
                                          loadingMessage={() => (
                                            <div className="flex items-center gap-2 py-2">
                                              <Loader2 className="w-4 h-4 animate-spin" />
                                              <span>Завантаження відділень...</span>
                                            </div>
                                          )}
                                          styles={{
                                            menu: (provided) => ({ ...provided, zIndex: 9999 }),
                                            container: (provided) => ({
                                              ...provided,
                                              width: "100%",
                                              maxWidth: "100%",
                                            }),
                                            control: (provided) => ({
                                              ...provided,
                                              width: "100%",
                                              maxWidth: "100%",
                                              minHeight: 42,
                                            }),
                                            input: (provided) => ({
                                              ...provided,
                                              fontSize: '16px', // Verhindert Auto-Zoom auf Mobile
                                            }),
                                            valueContainer: (provided) => ({
                                              ...provided,
                                              maxWidth: "calc(100% - 40px)",
                                              overflow: "hidden",
                                            }),
                                            singleValue: (provided) => ({
                                              ...provided,
                                              maxWidth: "100%",
                                              overflow: "hidden",
                                              textOverflow: "ellipsis",
                                              whiteSpace: "nowrap",
                                              fontSize: '16px',
                                            }),
                                            placeholder: (provided) => ({
                                              ...provided,
                                              overflow: "hidden",
                                              textOverflow: "ellipsis",
                                              whiteSpace: "nowrap",
                                              fontSize: '16px',
                                            })
                                          }}
                                          menuPortalTarget={document.body}
                                        />
                                      )}
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                                />
                              ) : (
                                <FormField name="addressCourier" control={form.control} render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Адреса доставки</FormLabel>
                                    <FormControl>
                                      <Input placeholder="вул. Шевченка, 10" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )} />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                                        </TabsContent>

                    {/* Самовивіз */}
                    <TabsContent value="pickup">
                      <div className="space-y-4 p-4 rounded-lg bg-gray-50 text-sm">
                        <p>Ви можете забрати замовлення самостійно. <br></br>Деталі по телефону: +38 (050) 47-30-644</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <Card className="shadow-md md:m-2 my-4 w-full">
                <CardHeader>
                  <CardTitle className="text-[#1996A3] text-[25px] font-semibold w-full">
                    Оплата
                  </CardTitle>
                </CardHeader>

                {/* уменьшил верхний внутренний отступ, чтобы заголовок и иконка были ближе */}
                <CardContent className="p-2">
                  <div className="w-full m-0 p-0 pt-0">
                    <PaymentMethod selectedLabel="По домовленості" />
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          <Card className="border-none shadow-none outline-none ring-0 p-0 gap-0 max-w-full overflow-hidden text-center md:text-left">
            <CardContent className="space-y-5 overflow-hidden">
              <Card className="shadow-md p-4 md:m-2 my-4 w-full">
                <CardHeader>
                  <CardTitle className="text-[#1996A3] text-[25px] font-semibold">
                    Підсумок замовлення
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="p-4 rounded-lg space-y-3 text-[13px] text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:justify-between items-center md:items-start border-b pb-2">
                      <span className="font-semibold text-gray-600">Прізвище:</span>
                      <span className="mt-1 md:mt-0">{form.watch("lastName") || "Не вказано"}</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:justify-between items-center md:items-start border-b pb-2">
                      <span className="font-semibold text-gray-600">Ім&apos;я:</span>
                      <span className="mt-1 md:mt-0">{form.watch("firstName") || "Не вказано"}</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:justify-between items-center md:items-start border-b pb-2">
                      <span className="font-semibold text-gray-600">Електронна пошта:</span>
                      <span className="mt-1 md:mt-0">{form.watch("email") || "Не вказано"}</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:justify-between items-center md:items-start border-b pb-2">
                      <span className="font-semibold text-gray-600">Телефон:</span>
                      <span className="mt-1 md:mt-0">{form.watch("phone") || "Не вказано"}</span>
                    </div>
                    {/* поле "Адреса" удалено из Summary */}
                    {form.watch("city") && (
                      <div className="flex flex-col md:flex-row md:justify-between items-center md:items-start border-b pb-2">
                        <span className="font-semibold text-gray-600">Місто:</span>
                        <span className="mt-1 md:mt-0">{form.watch("city")}</span>
                      </div>
                    )}
                    {form.watch("deliveryMethod") && (
                      <div className="flex flex-col md:flex-row md:justify-between items-center md:items-start border-b pb-2">
                        <span className="font-semibold text-gray-600">Доставка:</span>
                        <span className="mt-1 md:mt-0">
                          {form.watch("deliveryMethod") === "pickup"
                            ? "Самовивіз"
                            : form.watch("deliveryMethod") === "nova-poshta"
                              ? "Нова Пошта"
                              : "Не вказано"}
                        </span>
                      </div>
                    )}
                    {form.watch("warehouse") && (
                      <div className="flex flex-col md:flex-row md:justify-between items-center md:items-start border-b pb-2">
                        <span className="font-semibold text-gray-600">Відділення:</span>
                        <span className="truncate max-w-[300px] mt-1 md:mt-0">{form.watch("warehouse")}</span>
                      </div>
                    )}
                    {form.watch("addressCourier") && (
                      <div className="flex flex-col md:flex-row md:justify-between items-center md:items-start border-b pb-2">
                        <span className="font-semibold text-gray-600">Адреса доставки:</span>
                        <span className="mt-1 md:mt-0">{form.watch("addressCourier")}</span>
                      </div>
                    )}
                    {form.watch("additionalInfo") && (
                      <div className="flex flex-col md:flex-row md:justify-between items-center md:items-start border-b pb-2">
                        <span className="font-semibold text-gray-600">Додаткова інформація:</span>
                        <span className="mt-1 md:mt-0">{form.watch("additionalInfo")}</span>
                      </div>
                    )}
                    {/* показываем метод оплати всегда, по умолчанию — 'По домовленості' */}
                    <div className="flex flex-col md:flex-row md:justify-between items-center md:items-start border-b pb-2">
                      <span className="font-semibold text-gray-600">Оплата:</span>
                      <span className="mt-1 md:mt-0">{form.watch("paymentMethods") || "По домовленості"}</span>
                    </div>
                  </div>
                  <CardTitle className="text-[#1996A3] text-[20px] font-semibold py-4">
                    <p>Товари в замовленні</p>
                  </CardTitle>
                  {cart.length === 0 ? (
                    <div className="text-center py-8 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="text-yellow-600 mb-2">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <p className="text-lg font-semibold text-yellow-800 mb-2">Ваш кошик порожній</p>
                      <p className="text-yellow-700 mb-4">Додайте товари до кошика, щоб оформити замовлення</p>
                      <Button
                        onClick={() => router.push("/products")}
                        className="bg-[#1996A3] hover:bg-[#4FA7B9] text-white"
                      >
                        Перейти до каталогу
                      </Button>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col items-start justify-between p-3 text-base mt-3 border-b gap-3"
                      >
                        <div className="flex items-start gap-3 min-w-0 w-full">
                          {item.slug?.current ? (
                            <Link href={`/productDetails/${item.slug.current}`} className="flex-shrink-0 block">
                              <Image
                                src={item.image}
                                width={48}
                                height={48}
                                alt={item.name}
                                className="object-cover rounded w-12 h-12 hover:opacity-80 transition-opacity cursor-pointer"
                              />
                            </Link>
                          ) : (
                            <Image
                              src={item.image}
                              width={48}
                              height={48}
                              alt={item.name}
                              className="object-cover rounded w-12 h-12 flex-shrink-0"
                            />
                          )}
                          <div className="min-w-0 w-full">
                            {item.slug?.current ? (
                              <Link 
                                href={`/productDetails/${item.slug.current}`} 
                                className="block hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors"
                              >
                                <p className="font-semibold text-[16px] sm:text-[18px] truncate hover:text-[#147A86] transition-colors cursor-pointer">{item.name}</p>
                              </Link>
                            ) : (
                              <p className="font-semibold text-[16px] sm:text-[18px] truncate">{item.name}</p>
                            )}
                            <p className="text-sm text-gray-500 mt-1">
                              x{item.quantity} · {(item.price * item.quantity).toFixed(2)} грн.
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                </CardContent>
                <CardFooter>
                  <p className="text-xl font-semibold p-2 text-center md:text-right">Всього: {totalPrice.toFixed(2)} грн.</p>
                </CardFooter>
                <Button
                  type="submit"
                  className="w-full bg-[#1996A3] hover:bg-[#167A8A] sm:w-auto text-white text-lg font-semibold py-3"
                  disabled={isSubmitting || cart.length === 0}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Обробка...
                    </div>
                  ) : (
                    "Оформити замовлення"
                  )}
                </Button>
              </Card>
            </CardContent>

          </Card>
        </div>
      </form>
      {/* Success Modal */}
      <SuccessModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onGoHome={() => {
          setOpen(false);
          router.push("/");
        }}
        onContinueShopping={() => {
          setOpen(false);
          router.push("/products");
        }}
        title="Замовлення успішно оформлене!"
        message="Вам надіслано підтвердження на пошту. Наш менеджер зв'яжеться з вами найближчим часом."
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
        onRetry={() => {
          setErrorModal({ ...errorModal, isOpen: false });
          form.handleSubmit(onSubmit)();
        }}
        title={errorModal.title}
        message={errorModal.message}
        errorType={errorModal.errorType}
      />
    </FormProvider>

  );
}
