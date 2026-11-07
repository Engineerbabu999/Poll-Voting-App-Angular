import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Poll } from './poll.models';

@Injectable({
    providedIn: 'root'
})

export class PollService {
    private baseUrl = "http://localhost:8082/api/polls";

    constructor(private http: HttpClient) { }

    createPoll(poll: Omit<Poll, 'id'>) {
        return this.http.post<Poll>(this.baseUrl, { ...poll, id: null });
    }

    getAllPolls() {
        return this.http.get<Poll[]>(this.baseUrl);
    }

    vote(pollId: number, optionIndex: number) {
        return this.http.post(`${this.baseUrl}/vote`, { id: pollId, optionIndex });
    }

}
