"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
    const { theme = "light" } = useTheme()

    return (
        <Sonner
            theme={theme as ToasterProps["theme"]}
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast:
                        "group toast group-[.toaster]:bg-white group-[.toaster]:text-charcoal group-[.toaster]:border-line group-[.toaster]:shadow-lg rounded-xl overflow-hidden font-sans border",
                    description: "group-[.toast]:text-slate",
                    actionButton:
                        "group-[.toast]:bg-dusty-rose group-[.toast]:text-white rounded-md",
                    cancelButton:
                        "group-[.toast]:bg-gray-100 group-[.toast]:text-charcoal rounded-md",
                    success: "group-[.toaster]:border-dusty-rose/30",
                },
            }}
            {...props}
        />
    )
}

export { Toaster }
