'use client'

import React, { useState, useRef, useEffect } from 'react'
import { X, Bot, ChevronLeft } from 'lucide-react'
import { phpAPI } from '@/lib/php-api-client'

// Types for chat flow
interface Message {
    id: string
    type: 'bot' | 'user' | 'options' | 'slots'
    content: string
    options?: OptionItem[]
    slots?: SlotOption[]
    timestamp: Date
}

interface OptionItem {
    id: string | number
    label: string
    sublabel?: string
    value: any
}

interface ServiceOption {
    service_id: number
    title: string
    category: string
}

interface CenterOption {
    center_id: number
    name: string
    city: string
}

interface SlotOption {
    slot_id: number
    start_time: string
    end_time: string
}

interface DateAvailability {
    date: string;
    day_of_week?: string;
    has_availability?: boolean;
    formatted_date?: string;
}

type ChatState =
    | 'initial'
    | 'selecting_service'
    | 'selecting_center'
    | 'showing_slots'
    | 'under_development'

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [chatState, setChatState] = useState<ChatState>('initial')
    const [isTyping, setIsTyping] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Data for flow
    const [selectedService, setSelectedService] = useState<ServiceOption | null>(null)
    const [selectedCenter, setSelectedCenter] = useState<CenterOption | null>(null)

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const hasInitialized = useRef(false)

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isTyping])

    // Initialize greeting when opened (only once)
    useEffect(() => {
        if (isOpen && !hasInitialized.current && messages.length === 0) {
            hasInitialized.current = true
            showGreeting()
        }
    }, [isOpen])

    const generateId = () => Math.random().toString(36).substring(7)

    // Simulate typing delay for more natural feel
    const simulateTyping = (minMs = 500, maxMs = 1200): Promise<void> => {
        const delay = Math.random() * (maxMs - minMs) + minMs
        return new Promise(resolve => setTimeout(resolve, delay))
    }

    const addBotMessage = (content: string) => {
        setMessages(prev => [...prev, {
            id: generateId(),
            type: 'bot',
            content,
            timestamp: new Date()
        }])
    }

    const addUserMessage = (content: string) => {
        setMessages(prev => [...prev, {
            id: generateId(),
            type: 'user',
            content,
            timestamp: new Date()
        }])
    }

    const addOptionsMessage = (content: string, options: OptionItem[]) => {
        setMessages(prev => [...prev, {
            id: generateId(),
            type: 'options',
            content,
            options,
            timestamp: new Date()
        }])
    }

    const addSlotsMessage = (content: string, slots: SlotOption[]) => {
        setMessages(prev => [...prev, {
            id: generateId(),
            type: 'slots',
            content,
            slots,
            timestamp: new Date()
        }])
    }

    const showGreeting = async () => {
        setIsTyping(true)
        await simulateTyping(800, 1500)
        setIsTyping(false)

        addBotMessage("🙏 Namaskar! I am your virtual assistant to help with your queries.")

        await simulateTyping(400, 800)

        addOptionsMessage("Please select a category to proceed:", [
            { id: 'track', label: '📋 Track Application Status', value: 'track' },
            { id: 'appointment', label: '📅 Check Appointment Availability', value: 'appointment' },
            { id: 'locate', label: '📍 Locate Nearby Centers', value: 'locate' }
        ])
        setChatState('initial')
    }

    const resetChat = () => {
        setMessages([])
        setChatState('initial')
        setSelectedService(null)
        setSelectedCenter(null)
        setError(null)
        hasInitialized.current = false
    }

    const handleOpen = () => {
        setIsOpen(true)
        // showGreeting is handled by the useEffect
    }

    const handleClose = () => {
        setIsOpen(false)
    }

    const handleBack = async () => {
        if (chatState === 'selecting_service') {
            resetChat()
            showGreeting()
        } else if (chatState === 'selecting_center') {
            setSelectedService(null)
            await handleCheckAppointment()
        } else if (chatState === 'showing_slots') {
            if (selectedService) {
                setSelectedCenter(null)
                await handleServiceSelect(selectedService)
            }
        } else if (chatState === 'under_development') {
            resetChat()
            showGreeting()
        }
    }

    // Handle initial option selection
    const handleInitialOption = (option: OptionItem) => {
        addUserMessage(option.label)

        if (option.value === 'track') {
            handleTrackApplication()
        } else if (option.value === 'appointment') {
            handleCheckAppointment()
        } else if (option.value === 'locate') {
            handleLocateNearby()
        }
    }

    const handleTrackApplication = async () => {
        setIsTyping(true)
        await simulateTyping()
        setIsTyping(false)

        setChatState('under_development')
        addBotMessage("🚧 This feature is under development. Please check back soon!")

        await simulateTyping(300, 600)

        addOptionsMessage("Would you like to try something else?", [
            { id: 'restart', label: '🔄 Start Over', value: 'restart' }
        ])
    }

    const handleLocateNearby = async () => {
        setIsTyping(true)
        await simulateTyping()
        setIsTyping(false)

        setChatState('under_development')
        addBotMessage("🚧 This feature is under development. Please check back soon!")

        await simulateTyping(300, 600)

        addOptionsMessage("Would you like to try something else?", [
            { id: 'restart', label: '🔄 Start Over', value: 'restart' }
        ])
    }

    const handleCheckAppointment = async () => {
        setIsTyping(true)
        setError(null)

        try {
            const response = await phpAPI.getServices()
            const serviceList = response.data?.services || []
            const activeServices = serviceList.filter((s: any) => s.is_active === 1)
            const services = activeServices.length > 0 ? activeServices : serviceList

            setIsTyping(false)

            if (services.length === 0) {
                addBotMessage("Sorry, no services are currently available. Please try again later.")
                addOptionsMessage("Would you like to try something else?", [
                    { id: 'restart', label: '🔄 Start Over', value: 'restart' }
                ])
                setChatState('initial')
            } else {
                addBotMessage("Great choice! Let me help you check appointment availability.")

                await simulateTyping(300, 600)

                const options: OptionItem[] = services.map((s: ServiceOption) => ({
                    id: s.service_id,
                    label: s.title,
                    sublabel: s.category,
                    value: s
                }))

                addOptionsMessage("Which service would you like to book an appointment for?", options)
                setChatState('selecting_service')
            }
        } catch (err: any) {
            setIsTyping(false)
            console.error('Failed to fetch services:', err)
            setError(err.message || 'Failed to load services')
            addBotMessage(`Sorry, I couldn't load the services. ${err.message || 'Please ensure the backend server is running and try again.'}`)
            addOptionsMessage("Would you like to try again?", [
                { id: 'retry', label: '🔄 Try Again', value: 'retry_services' },
                { id: 'restart', label: '← Start Over', value: 'restart' }
            ])
        }
    }

    const handleServiceSelect = async (service: ServiceOption) => {
        setSelectedService(service)
        addUserMessage(service.title)
        setIsTyping(true)
        setError(null)

        try {
            const response = await phpAPI.getCentersForService(String(service.service_id))
            const centerList = response.data?.centers || []

            setIsTyping(false)

            if (centerList.length === 0) {
                addBotMessage(`Sorry, no centers are currently available for ${service.title}. Please try a different service.`)
                addOptionsMessage("Select a different service:", [
                    { id: 'back', label: '← Back to Services', value: 'back_services' }
                ])
                setChatState('selecting_service')
            } else {
                addBotMessage(`Found ${centerList.length} center${centerList.length > 1 ? 's' : ''} offering ${service.title}!`)

                await simulateTyping(300, 600)

                const options: OptionItem[] = centerList.map((c: CenterOption) => ({
                    id: c.center_id,
                    label: c.name,
                    sublabel: c.city,
                    value: c
                }))

                addOptionsMessage("Please select a center:", options)
                setChatState('selecting_center')
            }
        } catch (err: any) {
            setIsTyping(false)
            console.error('Failed to fetch centers:', err)
            setError(err.message || 'Failed to load centers')
            addBotMessage(`Sorry, I couldn't load the centers. ${err.message || 'Please try again.'}`)
        }
    }

    const handleCenterSelect = async (center: CenterOption) => {
        setSelectedCenter(center)
        addUserMessage(`${center.name}, ${center.city}`)
        setIsTyping(true)
        setError(null)

        try {
            // First get available dates
            const datesResponse = await phpAPI.getAvailableDates(
                String(center.center_id),
                String(selectedService!.service_id)
            )
            const dates = datesResponse.data?.dates || []

            if (dates.length === 0) {
                setIsTyping(false)
                addBotMessage(`Sorry, no available dates found for ${selectedService?.title} at ${center.name}. Please try a different center.`)
                setChatState('selecting_center')
                return
            }

            // Get the first available date
            const firstDate = dates[0]

            // Now get slots for that date
            const slotsResponse = await phpAPI.getAvailableSlots(
                String(center.center_id),
                String(selectedService!.service_id),
                firstDate
            )
            const slotList = slotsResponse.data?.slots || []

            setIsTyping(false)

            if (slotList.length === 0) {
                addBotMessage(`Sorry, no available slots found for ${formatDate(firstDate)}. Please try again later.`)
                setChatState('selecting_center')
            } else {
                addBotMessage(`✅ Found ${slotList.length} available slot${slotList.length > 1 ? 's' : ''} for ${selectedService?.title} at ${center.name}!`)

                await simulateTyping(400, 700)

                addSlotsMessage(`📅 Available slots on ${formatDate(firstDate)}:`, slotList)
                setChatState('showing_slots')

                await simulateTyping(300, 500)

                addBotMessage("To book an appointment, please visit the Appointments section on our website.")

                await simulateTyping(300, 600)

                addOptionsMessage("What would you like to do next?", [
                    { id: 'restart', label: '🔄 Start Over', value: 'restart' }
                ])
            }
        } catch (err: any) {
            setIsTyping(false)
            console.error('Failed to fetch slots:', err)
            setError(err.message || 'Failed to load available slots')
            addBotMessage(`Sorry, I couldn't load the available slots. ${err.message || 'Please try again.'}`)
        }
    }

    const handleOptionClick = (option: OptionItem) => {
        if (option.value === 'restart') {
            resetChat()
            showGreeting()
        } else if (option.value === 'retry_services') {
            handleCheckAppointment()
        } else if (option.value === 'back_services') {
            handleCheckAppointment()
        } else if (chatState === 'initial') {
            handleInitialOption(option)
        } else if (chatState === 'selecting_service') {
            handleServiceSelect(option.value)
        } else if (chatState === 'selecting_center') {
            handleCenterSelect(option.value)
        }
    }

    const formatDate = (item: DateAvailability): string => {
        try {
            // Extract the actual date string from the object
            const dateString = item.date;

            if (!dateString || typeof dateString !== 'string') {
                console.warn('Invalid or missing date string:', item);
                return item.formatted_date || dateString || 'Invalid Date';
            }

            // Create Date object from the ISO-like string (e.g., '2025-12-30')
            const date = new Date(dateString);

            // Check if the date is valid
            if (isNaN(date.getTime())) {
                console.warn('Invalid Date parsed from:', dateString);
                return item.formatted_date || dateString || 'Invalid Date';
            }

            // Format using Indian English locale
            const formatted = date.toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });

            // Example output: "Tuesday, 30 December 2025"
            return formatted;
        } catch (error) {
            console.error('Error in formatDate:', error, item);
            // Fallback to any pre-formatted date if available
            return item.formatted_date || item.date || 'Invalid Date';
        }
    };

    const formatTime = (timeStr: string) => {
        try {
            const [hours, minutes] = timeStr.split(':')
            const hour = parseInt(hours)
            const ampm = hour >= 12 ? 'PM' : 'AM'
            const hour12 = hour % 12 || 12
            return `${hour12}:${minutes} ${ampm}`
        } catch {
            return timeStr
        }
    }

    // Typing indicator component
    const TypingIndicator = () => (
        <div className="flex justify-start">
            <div className="bg-white text-gray-800 shadow-sm border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        </div>
    )

    return (
        <>
            {/* Floating Button */}
            <div className="fixed bottom-24 right-6 z-50">
                {!isOpen && (
                    <button
                        onClick={handleOpen}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 group"
                        title="Chat with Assistant"
                    >
                        <Bot className="h-6 w-6" />
                        <span className="absolute -top-2 -right-2 bg-green-500 w-4 h-4 rounded-full border-2 border-white animate-pulse"></span>
                    </button>
                )}
            </div>

            {/* Chat Widget */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[550px]">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 flex items-center justify-between shrink-0">
                        <div className="flex items-center space-x-3">
                            {chatState !== 'initial' && (
                                <button
                                    onClick={handleBack}
                                    className="text-white/80 hover:text-white transition-colors mr-1"
                                    title="Go back"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                            )}
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <Bot className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Virtual Assistant</h3>
                                <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                    <span className="text-orange-100 text-sm">Online</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
                        {messages.map((message) => (
                            <div key={message.id}>
                                {/* User Message */}
                                {message.type === 'user' && (
                                    <div className="flex justify-end mb-3">
                                        <div className="max-w-[80%] bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl rounded-br-sm px-4 py-3 shadow-sm">
                                            <p className="text-sm leading-relaxed">{message.content}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Bot Message */}
                                {message.type === 'bot' && (
                                    <div className="flex justify-start mb-3">
                                        <div className="max-w-[85%] bg-white text-gray-800 shadow-sm border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                                            <p className="text-sm leading-relaxed">{message.content}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Options Message */}
                                {message.type === 'options' && (
                                    <div className="flex justify-start mb-3">
                                        <div className="max-w-[90%] bg-white shadow-sm border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                                            <p className="text-sm text-gray-700 mb-3">{message.content}</p>
                                            <div className="space-y-2">
                                                {message.options?.map((option) => (
                                                    <button
                                                        key={option.id}
                                                        onClick={() => handleOptionClick(option)}
                                                        className="w-full text-left px-4 py-2.5 text-sm bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 text-orange-800 rounded-xl transition-all duration-200 border border-orange-200 hover:border-orange-300 hover:shadow-sm"
                                                    >
                                                        <span className="font-medium">{option.label}</span>
                                                        {option.sublabel && (
                                                            <span className="text-orange-600 text-xs ml-2">({option.sublabel})</span>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Slots Message */}
                                {message.type === 'slots' && (
                                    <div className="flex justify-start mb-3">
                                        <div className="max-w-[90%] bg-white shadow-sm border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                                            <p className="text-sm text-gray-700 mb-3">{message.content}</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {message.slots?.map((slot) => (
                                                    <div
                                                        key={slot.slot_id}
                                                        className="px-3 py-2 text-sm bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 rounded-lg border border-emerald-200 text-center"
                                                    >
                                                        <span className="font-medium">
                                                            {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isTyping && <TypingIndicator />}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 shrink-0">
                        <p className="text-xs text-gray-400 text-center">
                            Indian Consular Services • Virtual Assistant
                        </p>
                    </div>
                </div>
            )}
        </>
    )
}

export default Chatbot
