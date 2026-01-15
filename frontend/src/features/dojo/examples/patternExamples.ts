// Pattern Detective Hardcoded Examples
// 30 examples total: 15 design patterns + 15 code smells

export interface PatternExample {
    code: string;
    correctAnswer: string;
    options: string[];
    explanation: string;
    type: 'pattern' | 'smell';
}

// ============================================================================
// DESIGN PATTERN EXAMPLES (15)
// ============================================================================
const designPatterns: PatternExample[] = [
    {
        code: `class DatabaseConnection {
    private static instance: DatabaseConnection | null = null;
    
    private constructor() {}
    
    static getInstance(): DatabaseConnection {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }
}`,
        correctAnswer: 'Singleton',
        options: ['Singleton', 'Factory', 'Builder', 'Prototype'],
        explanation: 'The Singleton pattern ensures only one instance exists using a private constructor and static getInstance method.',
        type: 'pattern'
    },
    {
        code: `interface Animal {
    speak(): string;
}

class AnimalFactory {
    createAnimal(type: string): Animal {
        switch (type) {
            case 'dog': return new Dog();
            case 'cat': return new Cat();
            case 'bird': return new Bird();
            default: throw new Error('Unknown animal');
        }
    }
}`,
        correctAnswer: 'Factory',
        options: ['Factory', 'Abstract Factory', 'Builder', 'Singleton'],
        explanation: 'The Factory pattern creates objects without exposing instantiation logic, using a method that returns different types based on input.',
        type: 'pattern'
    },
    {
        code: `interface Observer {
    update(data: any): void;
}

class Newsletter {
    private subscribers: Observer[] = [];
    
    subscribe(observer: Observer) {
        this.subscribers.push(observer);
    }
    
    notify(news: string) {
        this.subscribers.forEach(sub => sub.update(news));
    }
}`,
        correctAnswer: 'Observer',
        options: ['Observer', 'Mediator', 'Command', 'Chain of Responsibility'],
        explanation: 'The Observer pattern defines a one-to-many dependency where the subject notifies all observers of state changes.',
        type: 'pattern'
    },
    {
        code: `interface PaymentStrategy {
    pay(amount: number): void;
}

class ShoppingCart {
    constructor(private paymentMethod: PaymentStrategy) {}
    
    checkout(total: number) {
        this.paymentMethod.pay(total);
    }
    
    setPaymentMethod(method: PaymentStrategy) {
        this.paymentMethod = method;
    }
}`,
        correctAnswer: 'Strategy',
        options: ['Strategy', 'State', 'Command', 'Template Method'],
        explanation: 'The Strategy pattern defines a family of algorithms, encapsulates each one, and makes them interchangeable at runtime.',
        type: 'pattern'
    },
    {
        code: `class Coffee {
    cost() { return 5; }
}

class MilkDecorator {
    constructor(private coffee: Coffee) {}
    
    cost() {
        return this.coffee.cost() + 2;
    }
}

class SugarDecorator {
    constructor(private coffee: Coffee) {}
    
    cost() {
        return this.coffee.cost() + 1;
    }
}`,
        correctAnswer: 'Decorator',
        options: ['Decorator', 'Adapter', 'Proxy', 'Facade'],
        explanation: 'The Decorator pattern attaches additional responsibilities to objects dynamically by wrapping them.',
        type: 'pattern'
    },
    {
        code: `interface MediaPlayer {
    play(filename: string): void;
}

class VlcPlayer {
    playVlc(filename: string) { /* VLC logic */ }
}

class VlcAdapter implements MediaPlayer {
    constructor(private vlc: VlcPlayer) {}
    
    play(filename: string) {
        this.vlc.playVlc(filename);
    }
}`,
        correctAnswer: 'Adapter',
        options: ['Adapter', 'Bridge', 'Decorator', 'Facade'],
        explanation: 'The Adapter pattern converts the interface of a class into another interface clients expect, enabling incompatible classes to work together.',
        type: 'pattern'
    },
    {
        code: `interface Command {
    execute(): void;
    undo(): void;
}

class TextEditor {
    private history: Command[] = [];
    
    executeCommand(cmd: Command) {
        cmd.execute();
        this.history.push(cmd);
    }
    
    undoLast() {
        const cmd = this.history.pop();
        cmd?.undo();
    }
}`,
        correctAnswer: 'Command',
        options: ['Command', 'Memento', 'Observer', 'Strategy'],
        explanation: 'The Command pattern encapsulates requests as objects, allowing parameterization and queuing of requests, including undo operations.',
        type: 'pattern'
    },
    {
        code: `class HouseBuilder {
    private house = new House();
    
    addRoof() { this.house.roof = true; return this; }
    addGarage() { this.house.garage = true; return this; }
    addPool() { this.house.pool = true; return this; }
    
    build() { return this.house; }
}

const house = new HouseBuilder()
    .addRoof()
    .addGarage()
    .build();`,
        correctAnswer: 'Builder',
        options: ['Builder', 'Factory', 'Prototype', 'Abstract Factory'],
        explanation: 'The Builder pattern separates construction of complex objects, allowing the same construction process to create different representations.',
        type: 'pattern'
    },
    {
        code: `class HomeTheater {
    private tv = new TV();
    private soundSystem = new SoundSystem();
    private lights = new Lights();
    
    watchMovie() {
        this.lights.dim();
        this.tv.on();
        this.soundSystem.setVolume(50);
    }
    
    endMovie() {
        this.lights.on();
        this.tv.off();
        this.soundSystem.off();
    }
}`,
        correctAnswer: 'Facade',
        options: ['Facade', 'Proxy', 'Adapter', 'Mediator'],
        explanation: 'The Facade pattern provides a simplified interface to a complex subsystem, hiding its complexity from clients.',
        type: 'pattern'
    },
    {
        code: `interface Cloneable {
    clone(): this;
}

class Shape implements Cloneable {
    constructor(public x: number, public y: number) {}
    
    clone() {
        return Object.assign(Object.create(this), this);
    }
}

const circle = new Shape(10, 20);
const copy = circle.clone();`,
        correctAnswer: 'Prototype',
        options: ['Prototype', 'Factory', 'Builder', 'Singleton'],
        explanation: 'The Prototype pattern creates new objects by copying an existing object (prototype), avoiding the cost of creating objects from scratch.',
        type: 'pattern'
    },
    {
        code: `class RealImage {
    constructor(private filename: string) {
        this.loadFromDisk();
    }
    loadFromDisk() { /* expensive operation */ }
    display() { /* display image */ }
}

class ImageProxy {
    private realImage: RealImage | null = null;
    
    constructor(private filename: string) {}
    
    display() {
        if (!this.realImage) {
            this.realImage = new RealImage(this.filename);
        }
        this.realImage.display();
    }
}`,
        correctAnswer: 'Proxy',
        options: ['Proxy', 'Decorator', 'Facade', 'Adapter'],
        explanation: 'The Proxy pattern provides a surrogate for another object to control access, often for lazy loading, access control, or caching.',
        type: 'pattern'
    },
    {
        code: `abstract class DataProcessor {
    process(data: string) {
        const parsed = this.parse(data);
        const validated = this.validate(parsed);
        return this.save(validated);
    }
    
    abstract parse(data: string): any;
    abstract validate(data: any): any;
    
    save(data: any) {
        console.log('Saving:', data);
    }
}`,
        correctAnswer: 'Template Method',
        options: ['Template Method', 'Strategy', 'Factory', 'Builder'],
        explanation: 'The Template Method defines the skeleton of an algorithm, deferring some steps to subclasses without changing the overall structure.',
        type: 'pattern'
    },
    {
        code: `class ChatRoom {
    showMessage(user: User, message: string) {
        console.log(\`[\${user.name}]: \${message}\`);
    }
}

class User {
    constructor(public name: string, private room: ChatRoom) {}
    
    send(message: string) {
        this.room.showMessage(this, message);
    }
}`,
        correctAnswer: 'Mediator',
        options: ['Mediator', 'Observer', 'Command', 'Chain of Responsibility'],
        explanation: 'The Mediator pattern defines an object that encapsulates how a set of objects interact, promoting loose coupling.',
        type: 'pattern'
    },
    {
        code: `class Iterator<T> {
    private index = 0;
    
    constructor(private collection: T[]) {}
    
    hasNext(): boolean {
        return this.index < this.collection.length;
    }
    
    next(): T {
        return this.collection[this.index++];
    }
}`,
        correctAnswer: 'Iterator',
        options: ['Iterator', 'Visitor', 'Composite', 'Observer'],
        explanation: 'The Iterator pattern provides a way to access elements of a collection sequentially without exposing its underlying representation.',
        type: 'pattern'
    },
    {
        code: `class EventEmitter {
    private events: Map<string, Function[]> = new Map();
    
    on(event: string, callback: Function) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event)!.push(callback);
    }
    
    emit(event: string, data?: any) {
        this.events.get(event)?.forEach(cb => cb(data));
    }
}`,
        correctAnswer: 'Observer',
        options: ['Observer', 'Mediator', 'Command', 'State'],
        explanation: 'This is an event-driven implementation of the Observer pattern, where callbacks are registered for specific events.',
        type: 'pattern'
    }
];

// ============================================================================
// CODE SMELL EXAMPLES (15)
// ============================================================================
const codeSmells: PatternExample[] = [
    {
        code: `class UserManager {
    private db: Database;
    private emailService: EmailService;
    private logger: Logger;
    private cache: Cache;
    
    createUser(data) { /* user creation */ }
    deleteUser(id) { /* deletion */ }
    sendWelcomeEmail(user) { /* email */ }
    sendPasswordReset(user) { /* email */ }
    validateEmail(email) { /* validation */ }
    hashPassword(pass) { /* hashing */ }
    generateReport() { /* reporting */ }
    exportToCSV() { /* export */ }
    importFromCSV() { /* import */ }
    // ... 50 more methods
}`,
        correctAnswer: 'God Object',
        options: ['God Object', 'Long Method', 'Feature Envy', 'Data Clumps'],
        explanation: 'A God Object is a class that knows too much or does too much. This class handles users, emails, validation, reports, and more.',
        type: 'smell'
    },
    {
        code: `function processOrder(order) {
    // Validate order
    if (!order.items) throw new Error('No items');
    if (!order.customer) throw new Error('No customer');
    // ... 50 more lines of validation
    
    // Calculate totals
    let subtotal = 0;
    for (const item of order.items) {
        subtotal += item.price * item.quantity;
        // ... 30 more lines of calculations
    }
    
    // Apply discounts
    // ... 40 more lines
    
    // Process payment
    // ... 60 more lines
    
    // Send confirmation
    // ... 30 more lines
}`,
        correctAnswer: 'Long Method',
        options: ['Long Method', 'God Object', 'Spaghetti Code', 'Feature Envy'],
        explanation: 'Long Method is when a function does too much. This should be broken into smaller, focused functions.',
        type: 'smell'
    },
    {
        code: `// File: utils.js
function calculateDiscount(price, discount) { return price * discount; }

// File: order.js
function applyDiscount(order) {
    // Doesn't use any of its own data
    const itemPrice = order.item.getPrice();
    const itemDiscount = order.item.getDiscount();
    const basePrice = order.item.getBasePrice();
    // Uses item's methods exclusively
    return calculateDiscount(itemPrice, itemDiscount);
}`,
        correctAnswer: 'Feature Envy',
        options: ['Feature Envy', 'Data Clumps', 'Long Method', 'Inappropriate Intimacy'],
        explanation: 'Feature Envy is when a method uses more features of another class than its own. The method should be moved to the Item class.',
        type: 'smell'
    },
    {
        code: `function createUser(firstName, lastName, street, city, state, zip, country) {
    // ...
}

function updateAddress(userId, street, city, state, zip, country) {
    // ...
}

function validateAddress(street, city, state, zip, country) {
    // ...
}`,
        correctAnswer: 'Data Clumps',
        options: ['Data Clumps', 'Long Parameter List', 'Primitive Obsession', 'Feature Envy'],
        explanation: 'Data Clumps occur when the same group of variables appear together in multiple places. These should be encapsulated in an Address class.',
        type: 'smell'
    },
    {
        code: `function calculateShipping(weight: number, type: string, dest: string) {
    if (type === 'standard') {
        if (dest === 'domestic') {
            return weight * 5;
        } else if (dest === 'international') {
            return weight * 15;
        }
    } else if (type === 'express') {
        if (dest === 'domestic') {
            return weight * 10;
        } else if (dest === 'international') {
            return weight * 25;
        }
    } else if (type === 'overnight') {
        // ... more conditions
    }
}`,
        correctAnswer: 'Switch Statements',
        options: ['Switch Statements', 'Long Method', 'Primitive Obsession', 'Speculative Generality'],
        explanation: 'Scattered switch/if-else statements based on type should often be replaced with polymorphism using the Strategy pattern.',
        type: 'smell'
    },
    {
        code: `const userType = 'admin'; // instead of enum
const userId = '12345'; // instead of User object
const money = 100.50; // instead of Money object
const phone = '123-456-7890'; // instead of PhoneNumber object
const email = 'test@example.com'; // instead of Email object`,
        correctAnswer: 'Primitive Obsession',
        options: ['Primitive Obsession', 'Data Clumps', 'Magic Numbers', 'String Typing'],
        explanation: 'Primitive Obsession is using primitives instead of small objects for concepts like money, phone numbers, or emails.',
        type: 'smell'
    },
    {
        code: `function calculatePrice(quantity) {
    const basePrice = quantity * 10;
    if (quantity > 100) {
        return basePrice * 0.85;  // What is 0.85?
    } else if (quantity > 50) {
        return basePrice * 0.9;   // What is 0.9?
    }
    return basePrice * 1.05;      // What is 1.05?
}`,
        correctAnswer: 'Magic Numbers',
        options: ['Magic Numbers', 'Primitive Obsession', 'Comments', 'Hard Coding'],
        explanation: 'Magic Numbers are unexplained numeric literals. Use named constants like BULK_DISCOUNT = 0.85.',
        type: 'smell'
    },
    {
        code: `class BaseProcessor {
    process(data) { /* never called directly */ }
}

class AbstractProcessor extends BaseProcessor {
    // Empty, just for "future use"
}

class SpecificProcessor extends AbstractProcessor {
    process(data) { /* actual implementation */ }
}

// Only SpecificProcessor is ever used`,
        correctAnswer: 'Speculative Generality',
        options: ['Speculative Generality', 'Dead Code', 'Lazy Class', 'Refused Bequest'],
        explanation: 'Speculative Generality is creating abstractions "just in case" they might be needed. YAGNI - You Ain\'t Gonna Need It.',
        type: 'smell'
    },
    {
        code: `function processData(data) {
    // Old implementation - keeping just in case
    // if (data.legacy) {
    //     return legacyProcess(data);
    // }
    
    const result = newProcess(data);
    
    // TODO: Implement this later
    // logResult(result);
    
    return result;
}

function unusedHelper() {
    // This function is never called
    return 'unused';
}`,
        correctAnswer: 'Dead Code',
        options: ['Dead Code', 'Comments', 'Speculative Generality', 'Lazy Class'],
        explanation: 'Dead Code includes commented-out code, unreachable code, and unused functions. It should be deleted, not commented.',
        type: 'smell'
    },
    {
        code: `class Order {
    constructor(
        public items: Item[],
        public customer: Customer,
        public shippingAddress: Address,
        public billingAddress: Address,
        public paymentMethod: PaymentMethod,
        public discounts: Discount[],
        public status: string,
        public createdAt: Date,
        public updatedAt: Date,
        public processedBy: Employee,
        // ... 10 more fields
    ) {}
}`,
        correctAnswer: 'Large Class',
        options: ['Large Class', 'God Object', 'Data Clumps', 'Feature Envy'],
        explanation: 'A Large Class has too many fields and responsibilities. Extract related fields into smaller classes like OrderStatus, OrderTimestamps.',
        type: 'smell'
    },
    {
        code: `class Animal {
    swim() { throw new Error('Not implemented'); }
    fly() { throw new Error('Not implemented'); }
    walk() { throw new Error('Not implemented'); }
}

class Dog extends Animal {
    walk() { /* dogs walk */ }
    swim() { throw new Error('Dogs can swim sometimes'); }
    fly() { throw new Error('Dogs cannot fly'); }
}`,
        correctAnswer: 'Refused Bequest',
        options: ['Refused Bequest', 'Lazy Class', 'Speculative Generality', 'Inappropriate Intimacy'],
        explanation: 'Refused Bequest is when a subclass inherits methods/properties it doesn\'t want. Use composition or smaller interfaces.',
        type: 'smell'
    },
    {
        code: `class Order {
    getCustomerEmail() {
        return this.customer.account.email.value;
    }
    
    getCustomerCity() {
        return this.customer.address.location.city.name;
    }
    
    getPaymentCardNumber() {
        return this.payment.method.card.number.masked;
    }
}`,
        correctAnswer: 'Message Chains',
        options: ['Message Chains', 'Feature Envy', 'Inappropriate Intimacy', 'Middle Man'],
        explanation: 'Message Chains (a.b.c.d.e) violate the Law of Demeter. Use wrapper methods to hide the chain.',
        type: 'smell'
    },
    {
        code: `class CustomerService {
    private repository: CustomerRepository;
    
    getCustomer(id) { return this.repository.get(id); }
    saveCustomer(c) { return this.repository.save(c); }
    deleteCustomer(id) { return this.repository.delete(id); }
    findCustomers(q) { return this.repository.find(q); }
    // Every method just delegates to repository
}`,
        correctAnswer: 'Middle Man',
        options: ['Middle Man', 'Lazy Class', 'Feature Envy', 'Message Chains'],
        explanation: 'A Middle Man is a class that delegates most of its work to another class. Consider removing it or merging.',
        type: 'smell'
    },
    {
        code: `class DataClass {
    public name: string;
    public age: number;
    public email: string;
    public address: string;
    
    // No methods other than getters/setters
    getName() { return this.name; }
    setName(n: string) { this.name = n; }
    getAge() { return this.age; }
    setAge(a: number) { this.age = a; }
    // ... etc
}`,
        correctAnswer: 'Data Class',
        options: ['Data Class', 'Lazy Class', 'Primitive Obsession', 'Feature Envy'],
        explanation: 'A Data Class only has fields and getters/setters with no real behavior. Move behavior that operates on this data into the class.',
        type: 'smell'
    },
    {
        code: `function processItems(items: any[]) {
    const result = [];
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        // Copy-pasted three times with slight variations
        if (item.type === 'A') {
            const price = item.basePrice * 1.1;
            const tax = price * 0.08;
            result.push({ ...item, total: price + tax });
        } else if (item.type === 'B') {
            const price = item.basePrice * 1.2;
            const tax = price * 0.08;
            result.push({ ...item, total: price + tax });
        } else if (item.type === 'C') {
            const price = item.basePrice * 1.15;
            const tax = price * 0.08;
            result.push({ ...item, total: price + tax });
        }
    }
    return result;
}`,
        correctAnswer: 'Duplicate Code',
        options: ['Duplicate Code', 'Long Method', 'Switch Statements', 'Copy Paste Programming'],
        explanation: 'Duplicate Code is the same code structure repeated in multiple places. Extract to a common function with parameters.',
        type: 'smell'
    }
];

// Export all pattern examples
export const PATTERN_EXAMPLES: PatternExample[] = [...designPatterns, ...codeSmells];

export function getRandomPatternExample(type?: 'pattern' | 'smell'): PatternExample {
    if (type) {
        const filtered = PATTERN_EXAMPLES.filter(e => e.type === type);
        return filtered[Math.floor(Math.random() * filtered.length)];
    }
    return PATTERN_EXAMPLES[Math.floor(Math.random() * PATTERN_EXAMPLES.length)];
}
