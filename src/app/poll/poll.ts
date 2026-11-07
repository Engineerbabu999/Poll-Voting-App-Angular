import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { PollService } from '../poll.service';
import { Poll as PollModel } from '../poll.models';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  imports: [FormsModule, CommonModule],
  selector: 'app-poll',
  standalone: true,
  styleUrl: './poll.css',
  templateUrl: './poll.html',
})
export class Poll implements OnInit {
  polls: PollModel[] = [];

  constructor(private pollService: PollService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadPolls();
  }

  loadPolls(): void {
    this.pollService.getAllPolls().subscribe({
      next: (res) => {
        console.log('API Response:', res);
        console.log('Is Array:', Array.isArray(res));
        console.log('Poll Count:', res.length);

        this.polls = [...res];
        this.cdr.detectChanges();

        console.log('Component Polls:', this.polls);
      },
      error: (err) => {
        console.error('Error loading polls:', err);
      }
    });
  }

  vote(pollId: number, optionIndex: number): void {
    this.pollService.vote(pollId, optionIndex).subscribe({
      next: () => {
        this.loadPolls();

      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  getTotalVotes(poll: PollModel): number {
    return poll.options.reduce(
      (total, option) => total + option.voteCount,
      0
    );
  }

  getVotePercentage(votes: number, poll: PollModel): number {
    const totalVotes = this.getTotalVotes(poll);

    if (totalVotes === 0) return 0;

    return (votes / totalVotes) * 100;
  }

  getAllVotes(): number {
    return this.polls.reduce(
      (total, poll) => total + this.getTotalVotes(poll),
      0
    );
  }
}