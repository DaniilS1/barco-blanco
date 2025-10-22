"use client";

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Select from "react-select";
import * as z from "zod"
import logo from "../../../public/icons/nova_poshta_2014_logo.svg(1).png";
import ukrLogo from "../../../public/icons/Ukrposhta.png";
import pickupLogo from "../../../public/icons/pickup.png";

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import CreatableSelect from "react-select/creatable";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { RadioGroup } from '@headlessui/react';
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



type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

type DeliveryMethod = "nova-poshta" | "ukrposhta" | "pickup" | string;

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
  addressCourier?: string;              // Wenn Lieferung per Kurier
  address?: string;                      // Optional: feste Adresse z. B. bei Abholung

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
    address: z.string().min(5, { message: "Введіть правильну адресу." }),
    addressCourier: z.string().optional(),
    city: z.string().nullable().optional(),
    warehouse: z.string().optional(),
    additionalInfo: z.string().optional(),
    selectedToggle: z.string().optional(),
    paymentMethods: z.string().min(1, { message: "Оберіть метод оплати." }),
    pickup: z.string().optional(),
    pickupDeatails: z.string().optional(),
    deliveryMethod: z.enum(["nova-poshta", "ukr-poshta", "pickup"], {
      required_error: "Оберіть спосіб доставки.",
    }),
  })
  .superRefine((data, ctx) => {
    if (data.deliveryMethod === "pickup") {
      // No additional validation needed for pickup
    } else {
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
            message: "Введіть правильну адресу для кур’єра.",
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


const paymentMethods = [
  { id: 'by_agreement', label: 'По домовленості' }
];


export default function OrderForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedToggle, setSelectedToggle] = useState("");
  const { cart, getCartTotalPrice } = useCart();
  const [selectedCity, setSelectedCity] = useState<string>();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined);
  
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
      address: "",
      addressCourier: "",
      city: selectedCity || "",
      warehouse: "",
      additionalInfo: "",
      selectedToggle: "",
      paymentMethods: "",
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
      setOpen(true);
      form.reset();
      setSelectedPayment("");
      setSelectedCity(undefined);
      setWarehouses([]);
      localStorage.removeItem('orderFormData'); // Clear saved data
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

  const handleSelectPayment = (value: string) => {
    // Wenn das Feld schon ausgewählt ist → wieder abwählen
    if (selectedPayment === value) {
      setSelectedPayment("");
    } else {
      setSelectedPayment(value);
    }
  };

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
    if (!isClient) return;
    
    const subscription = form.watch((value) => {
      localStorage.setItem('orderFormData', JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [form, isClient]);

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 py-12 text-lg max-w-7xl mx-auto mt-0 p-3 overflow-hidden">
          <Card className="border-none shadow-none outline-none ring-0 p-0 gap-0 max-w-full overflow-hidden">
            <CardContent>
              <Card className="shadow-md p-4 m-2 w-full">
                <CardHeader>
                  <CardTitle className="text-[#1996A3] text-[25px] font-semibold">
                    Контактні дані
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">

                  <FormField name="lastName" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Прізвище</FormLabel>
                      <FormControl>
                        <Input placeholder="Петренко" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField name="firstName" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ім&apos;я</FormLabel>
                      <FormControl>
                        <Input placeholder="Іван" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField name="email" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Електронна пошта</FormLabel>
                      <FormControl>
                        <Input placeholder="ivan@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField name="phone" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Телефон</FormLabel>
                      <FormControl>
                        <Input placeholder="+38 (097) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="address" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Адреса</FormLabel>
                      <FormControl>
                        <Input placeholder="вул. Шевченка, 10" {...field} />
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
              <Card className="shadow-md p-4 m-2 w-full max-w-full overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-[#1996A3] text-[20px] md:text-[25px] font-semibold">
                    Доставка
                  </CardTitle>
                </CardHeader>
                <CardContent className="overflow-hidden">
                  <Tabs value={activeTab} onValueChange={(value) => {
                    setActiveTab(value);
                    form.setValue("deliveryMethod", value as "nova-poshta" | "pickup" | "ukr-poshta");
                    if (value === "pickup") {
                      setSelectedToggle("");
                      setSelectedCity("");
                      form.setValue("selectedToggle", "");
                      form.setValue("city", "");
                      form.setValue("warehouse", "");
                    }
                  }} className="w-full overflow-hidden">
                    <TabsList className="flex flex-wrap sm:flex-nowrap overflow-x-auto gap-2 w-full mb-2">
                      <TabsTrigger value="nova-poshta"><Image src={logo} alt="Nova Poshta" className="w-3 h-auto mr-2" />Нова Пошта</TabsTrigger>
                      <TabsTrigger value="ukr-poshta" className="hidden"><Image src={ukrLogo} alt="Ukr Poshta" className="w-2 h-auto mr-2" />Укр Пошта</TabsTrigger>
                      <TabsTrigger value="pickup"><Image src={pickupLogo} alt="Pickup" className="w-5 h-auto mr-2" />Самовивіз</TabsTrigger>
                    </TabsList>
                    {!activeTab && (
                      <div className="text-gray-500 text-sm px-4 py-2">
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

                    {/* Укр Пошта */}
                    <TabsContent value="ukr-poshta">
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



              <Card className="shadow-md p-4 m-2 w-full">
                <CardHeader>
                  <CardTitle className="text-[#1996A3] text-[25px] font-semibold w-full">
                    Оплата
                  </CardTitle>
                  <CardContent>
                    <RadioGroup name="paymentMethods"
                      value={selectedPayment}
                      onChange={(value) => {
                        handleSelectPayment(value);
                        form.setValue("paymentMethods", value);
                      }}
                    >
                      <div className="space-y-2 mt-8">
                        {paymentMethods.map((method) => (
                          <RadioGroup.Option
                            key={method.id}
                            value={method.label}
                            className={({ checked }) =>
                              `flex items-center justify-between gap-3 cursor-pointer rounded-lg px-4 py-2 border transition
                           ${checked ? 'bg-[#1996A3] text-white border-[#1996A3]' : 'bg-white border-gray-300'}`
                            }
                          >
                            {({ checked }) => (
                              <>
                                <span className="text-sm">{method.label}</span>
                                <div
                                  className={`h-4 w-4 rounded-full border-2 flex items-center justify-center
                                ${checked ? 'border-white' : 'border-gray-300'}`}
                                >
                                  {checked && <div className="h-2 w-2 rounded-full bg-white" />}
                                </div>
                              </>
                            )}
                          </RadioGroup.Option>
                        ))}
                        <RadioGroup.Option className="hidden" value="" />
                      </div>
                    </RadioGroup>
                    {selectedPayment && (
                      <div className="mt-4 text-[13px] text-gray-600">
                        Вибрано: {paymentMethods.find(m => m.label === selectedPayment)?.label}
                      </div>
                    )}

                  </CardContent>
                </CardHeader>
                <CardContent>

                </CardContent>
              </Card>
            </CardContent>
          </Card>

          <Card className="border-none shadow-none outline-none ring-0 p-0 gap-0 max-w-full overflow-hidden">
            <CardContent className="space-y-5 overflow-hidden">
              <Card className="shadow-md p-4 m-2 w-full">
                <CardHeader>
                  <CardTitle className="text-[#1996A3] text-[25px] font-semibold">
                    Підсумок замовлення
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <div className=" p-4 rounded-lg space-y-3 text-[13px]">
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-semibold text-gray-600">Прізвище:</span>
                      <span>{form.watch("lastName") || "Не вказано"}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-semibold text-gray-600">Ім&apos;я:</span>
                      <span>{form.watch("firstName") || "Не вказано"}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-semibold text-gray-600">Електронна пошта:</span>
                      <span>{form.watch("email") || "Не вказано"}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-semibold text-gray-600">Телефон:</span>
                      <span>{form.watch("phone") || "Не вказано"}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-semibold text-gray-600">Адреса:</span>
                      <span>{form.watch("address") || "Не вказано"}</span>
                    </div>
                    {form.watch("city") && (
                      <div className="flex justify-between border-b pb-2">
                        <span className="font-semibold text-gray-600">Місто:</span>
                        <span>{form.watch("city")}</span>
                      </div>
                    )}
                    {form.watch("deliveryMethod") && (
                      <div className="flex justify-between border-b pb-2">
                        <span className="font-semibold text-gray-600">Доставка:</span>
                        <span>{form.watch("deliveryMethod") === "pickup"
                          ? "Самовивіз"
                          : form.watch("deliveryMethod") === "ukr-poshta"
                            ? "Укр Пошта"
                            : form.watch("deliveryMethod") === "nova-poshta"
                              ? "Нова Пошта"
                              : "Не вказано"}</span>
                      </div>
                    )}
                    {form.watch("warehouse") && (
                      <div className="flex justify-between border-b pb-2">
                        <span className="font-semibold text-gray-600">Відділення:</span>
                        <span className="truncate max-w-[200px] sm:max-w-[300px] overflow-hidden text-right">{form.watch("warehouse")}</span>
                      </div>
                    )}
                    {form.watch("addressCourier") && (
                      <div className="flex justify-between border-b pb-2">
                        <span className="font-semibold text-gray-600">Адреса доставки:</span>
                        <span>{form.watch("addressCourier")}</span>
                      </div>
                    )}
                    {form.watch("additionalInfo") && (
                      <div className="flex justify-between border-b pb-2">
                        <span className="font-semibold text-gray-600">Додаткова інформація:</span>
                        <span>{form.watch("additionalInfo")}</span>
                      </div>
                    )}
                    {form.watch("paymentMethods") && (
                      <div className="flex justify-between border-b pb-2">
                        <span className="font-semibold text-gray-600">Оплата:</span>
                        <span>{form.watch("paymentMethods")}</span>
                      </div>
                    )}
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
                      <div key={item.id} className="flex items-center justify-between p-3 text-base mt-3 border-b">
                        <div className="flex items-center gap-3">
                          <Image src={item.image} width={40} height={40} alt={item.name} className="object-cover rounded" />
                          <p className="font-semibold text-[14px]">{item.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <p>x{item.quantity}</p>
                          <p>{(item.price * item.quantity).toFixed(2)} грн.</p>
                        </div>
                      </div>
                    ))
                  )}

                </CardContent>
                <CardFooter>
                  <p className="text-xl font-semibold p-2">Всього: {totalPrice.toFixed(2)} грн.</p>
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
