


// Pub/Sub design for handling state changing event, to make things a bit easy to read

class   EventObserver {
    private observers: {[key: string]: ((data: any) => void)[]};

    constructor() {
        this.observers = {};
    }

    subscribe(event: string, callback: (data: any) => void) {
        if (!this.observers[event])
            this.observers[event] = [];
        this.observers[event].push(callback);
    }

    unsubscribe(event: string, callback: (data: any) => void) {
        if (!this.observers[event])
            return ;
        this.observers[event] = this.observers[event].filter((cb) => cb != callback);
    }

    publish(event: string, data: any) {
        if (!this.observers[event])
            return ;
    
        this.observers[event].forEach((cb) => cb(data))
    }

}


const eventObserver = new EventObserver();

export default eventObserver;