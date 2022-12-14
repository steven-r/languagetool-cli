/* eslint-disable @typescript-eslint/no-explicit-any */

declare module 'concurrent-queue' {

    interface LimitConfig {
        concurrency?: number;
        maxSize?: number;
        softMaxSize?: number;
    }
  
    export default function cq(): cqImpl;
  
    export interface cqImpl {
        process(processor: (task: any) => Promise<any>): queue;
        limit(limitConfig: LimitConfig): cqImpl;
    }
  
    export interface queue {
        (item: any): Promise<any>;
    }
  }