/**
 * Данные ролей и тегов для Mini App
 */

// Роли пользователей
const ROLES = {
    life: {
        title: "👤 Кто вы?",
        items: [
            { code: "pensioner", emoji: "👴", name: "Пенсионер", tags: ["pensions", "benefits", "zhkh", "health"] },
            { code: "parent", emoji: "👨‍👩‍👧", name: "Родитель", tags: ["family", "matcapital", "education", "child_benefits"] },
            { code: "driver", emoji: "🚗", name: "Водитель", tags: ["pdd", "osago", "taxi"] },
            { code: "student", emoji: "🎓", name: "Студент", tags: ["education", "stipend", "youth"] },
            { code: "invalid", emoji: "♿", name: "Инвалид", tags: ["benefits", "pensions", "health", "social"] },
            { code: "renter", emoji: "🏠", name: "Арендатор", tags: ["zhkh", "rent", "consumer"] },
            { code: "owner", emoji: "🏢", name: "Собственник", tags: ["zhkh", "kaprem", "mortgage", "property_tax"] },
            { code: "military", emoji: "🪖", name: "Военный", tags: ["army", "military_mortgage", "military_pay"] }
        ]
    },
    business: {
        title: "💼 Ваш бизнес",
        items: [
            { code: "ip", emoji: "💳", name: "ИП", tags: ["taxes", "ip", "inspections", "marking"] },
            { code: "small_biz", emoji: "🏪", name: "Малый бизнес", tags: ["taxes", "inspections", "msp", "kkt", "tenders"] },
            { code: "beauty", emoji: "💇", name: "Бьюти", tags: ["sanpin", "licenses", "selfemployed", "marking"] },
            { code: "autoservice", emoji: "🔧", name: "Автосервис", tags: ["auto", "licenses", "inspections", "ecology"] },
            { code: "ecommerce", emoji: "🛒", name: "E-commerce", tags: ["ecom", "marketplaces", "marking", "taxes"] },
            { code: "horeca", emoji: "🍽️", name: "Общепит", tags: ["marking", "sanpin", "inspections", "alcohol"] },
            { code: "it_company", emoji: "💻", name: "IT-компания", tags: ["it", "personal_data", "it_benefits"] }
        ]
    },
    interests: {
        title: "🎯 Интересы",
        items: [
            { code: "internet", emoji: "📱", name: "IT и соцсети", tags: ["it", "vpn", "personal_data", "bloggers"] },
            { code: "invest", emoji: "📈", name: "Инвестиции", tags: ["crypto", "cfa", "finmarket"] },
            { code: "realty", emoji: "🏗️", name: "Недвижимость", tags: ["ddu", "escrow", "mortgage"] },
            { code: "ecology", emoji: "🌲", name: "Экология", tags: ["ecology", "waste", "nature"] },
            { code: "hunting", emoji: "🎣", name: "Охота/рыбалка", tags: ["nature", "licenses", "weapons"] }
        ]
    }
};

// Теги (промежуточный слой)
const TAGS = {
    // Социальное
    pensions: { name: "Пенсии", category: "social", emoji: "👴" },
    benefits: { name: "Льготы", category: "social", emoji: "🏛️" },
    health: { name: "Здоровье", category: "social", emoji: "🏥" },
    family: { name: "Семья и дети", category: "social", emoji: "👶" },
    matcapital: { name: "Маткапитал", category: "social", emoji: "💰" },
    child_benefits: { name: "Детские пособия", category: "social", emoji: "👶" },
    labor: { name: "Труд", category: "social", emoji: "💼" },
    social: { name: "Соцзащита", category: "social", emoji: "🛡️" },

    // Образование
    education: { name: "Образование", category: "education", emoji: "🎓" },
    stipend: { name: "Стипендии", category: "education", emoji: "💵" },
    youth: { name: "Молодёжь", category: "education", emoji: "🧑" },

    // Жильё
    zhkh: { name: "ЖКХ", category: "housing", emoji: "🏠" },
    kaprem: { name: "Капремонт", category: "housing", emoji: "🔨" },
    mortgage: { name: "Ипотека", category: "housing", emoji: "🏦" },
    rent: { name: "Аренда", category: "housing", emoji: "🔑" },
    property_tax: { name: "Налог на имущество", category: "housing", emoji: "💵" },
    ddu: { name: "ДДУ", category: "housing", emoji: "📝" },
    escrow: { name: "Эскроу", category: "housing", emoji: "🔐" },

    // Авто
    pdd: { name: "ПДД и штрафы", category: "auto", emoji: "🚗" },
    osago: { name: "ОСАГО", category: "auto", emoji: "📋" },
    taxi: { name: "Такси", category: "auto", emoji: "🚕" },
    auto: { name: "Авто", category: "auto", emoji: "🚙" },

    // Бизнес
    taxes: { name: "Налоги", category: "business", emoji: "💵" },
    inspections: { name: "Проверки", category: "business", emoji: "🔍" },
    marking: { name: "Маркировка", category: "business", emoji: "🏷️" },
    ip: { name: "ИП", category: "business", emoji: "💳" },
    msp: { name: "МСП", category: "business", emoji: "🤝" },
    kkt: { name: "Кассы", category: "business", emoji: "🧾" },
    tenders: { name: "Госзакупки", category: "business", emoji: "📦" },
    sanpin: { name: "СанПиН", category: "business", emoji: "🧼" },
    licenses: { name: "Лицензии", category: "business", emoji: "📜" },
    selfemployed: { name: "Самозанятые", category: "business", emoji: "🙋" },
    ecom: { name: "E-commerce", category: "business", emoji: "🛒" },
    marketplaces: { name: "Маркетплейсы", category: "business", emoji: "📦" },
    alcohol: { name: "Алкоголь", category: "business", emoji: "🍷" },
    it_benefits: { name: "Льготы IT", category: "business", emoji: "💻" },

    // Цифровое
    it: { name: "IT и интернет", category: "digital", emoji: "💻" },
    vpn: { name: "VPN и блокировки", category: "digital", emoji: "🔐" },
    personal_data: { name: "Персданные", category: "digital", emoji: "🔒" },
    bloggers: { name: "Блогеры", category: "digital", emoji: "📱" },
    crypto: { name: "Криптовалюта", category: "digital", emoji: "💎" },
    cfa: { name: "ЦФА", category: "digital", emoji: "📊" },
    finmarket: { name: "Финрынки", category: "digital", emoji: "📈" },

    // Армия
    army: { name: "Армия", category: "army", emoji: "🪖" },
    military_mortgage: { name: "Военная ипотека", category: "army", emoji: "🏠" },
    military_pay: { name: "Выплаты военным", category: "army", emoji: "💵" },

    // Экология
    ecology: { name: "Экология", category: "ecology", emoji: "🌲" },
    waste: { name: "Отходы", category: "ecology", emoji: "🗑️" },
    nature: { name: "Природа", category: "ecology", emoji: "🌳" },
    weapons: { name: "Оружие", category: "ecology", emoji: "🔫" },

    // Права потребителей
    consumer: { name: "Права потребителей", category: "consumer", emoji: "🛒" }
};

// Категории для группировки
const CATEGORIES = {
    social: { emoji: "👴", name: "Социальное" },
    education: { emoji: "🎓", name: "Образование" },
    housing: { emoji: "🏠", name: "Жильё" },
    auto: { emoji: "🚗", name: "Авто" },
    business: { emoji: "💼", name: "Бизнес" },
    digital: { emoji: "💻", name: "Цифровое" },
    army: { emoji: "🪖", name: "Армия" },
    ecology: { emoji: "🌲", name: "Экология" },
    consumer: { emoji: "🛒", name: "Потребители" }
};
