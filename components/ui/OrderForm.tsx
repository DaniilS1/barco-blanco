"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }),
  city: z.string().min(2, { message: "City must be at least 2 characters." }),
  postalCode: z.string().min(5, { message: "Postal code must be at least 5 characters." }),
  country: z.string().min(2, { message: "Country must be at least 2 characters." }),
  additionalInfo: z.string().optional(),
})

export default function OrderForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      country: "",
      additionalInfo: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    console.log(values)
    setTimeout(() => {
      setIsSubmitting(false)
      alert("Order submitted successfully!")
      form.reset()
    }, 1200)
  }

  return (
    // wrapper центрует страницу и даёт отступы на мобильных
    <div className="order-form-wrapper max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="order-form-grid grid gap-6 lg:grid-cols-2">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Delivery Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="+1 (555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="New York" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input placeholder="10001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="United States" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="additionalInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Information</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Any special instructions for delivery" {...field} />
                      </FormControl>
                      <FormDescription>Optional: Add any special instructions or notes for delivery.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Place Order"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="w-full self-start">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
                    <CardContent>
                      {/* краткий пример сводки */}
                      <p className="mb-4 text-sm text-muted-foreground">Тут буде список товарів та ціни. Поки — прикладна інформація.</p>
          
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-700">
                          <span>Товари</span>
                          <span>₴0.00</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-700 mt-2">
                          <span>Доставка</span>
                          <span>за домовленістю</span>
                        </div>
                      </div>
          
                      {/* Спосіб оплати — улучшенный визуальный блок */}
                      <div className="p-4 rounded-lg border border-gray-100 bg-white">
                        <h4 className="font-semibold mb-3 text-sm">Спосіб оплати</h4>
          
                        <div className="flex flex-wrap gap-2 mb-3">
                          {/* активный способ */}
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#1996A3] text-white text-sm font-medium">
                            За домовленістю
                          </span>
          
                          {/* неактивные варианты — помечены как "скоро" */}
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-400 text-sm">
                            Передоплата
                            <span className="ml-2 inline-flex items-center bg-gray-200 text-gray-500 text-xs px-1 rounded">скоро</span>
                          </span>
          
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-400 text-sm">
                            Оплата карткою
                            <span className="ml-2 inline-flex items-center bg-gray-200 text-gray-500 text-xs px-1 rounded">скоро</span>
                          </span>
          
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-400 text-sm">
                            Готівка при отриманні
                            <span className="ml-2 inline-flex items-center bg-gray-200 text-gray-500 text-xs px-1 rounded">скоро</span>
                          </span>
                        </div>
          
                        <p className="text-sm text-gray-700 mb-2">
                          Наразі оплата узгоджується з менеджером після підтвердження замовлення — ми зв'яжемося для уточнення деталей.
                        </p>
          
                        <p className="text-sm text-gray-500 mb-3">
                          Порада: бажаний спосіб оплати можна зазначити в полі «Додаткова інформація».
                        </p>
          
                        <div className="flex items-center gap-3">
                          <a
                            href="mailto:barcoblanco@ukr.net"
                            className="text-[#1996A3] font-medium text-sm hover:underline"
                          >
                            Зв'язатися з менеджером
                          </a>
                          <span className="text-xs text-gray-400">• відповідь протягом робочого дня</span>
                        </div>
                      </div>
                    </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <p className="text-lg font-semibold">Total: ₴0.00</p>
            <Button className="w-full" onClick={() => alert("Перехід до оплати / підтвердження")}>
              Перейти до оплати
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

