import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
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

  // Create poll form
  newQuestion = '';
  newOptions: string[] = ['', ''];

  isSubmitting = false;
  votingPollId: number | null = null;

  private pollService = inject(PollService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadPolls();
  }

  // Fetch all polls
  loadPolls(): void {
    this.pollService.getAllPolls().subscribe({
      next: (res) => {
        this.polls = [...res];
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading polls:', err);
      }
    });
  }

  // Add another option to the form
  addOption(): void {
    this.newOptions.push('');
  }

  // Remove an option
  removeOption(index: number): void {
    if (this.newOptions.length > 2) {
      this.newOptions.splice(index, 1);
    }


  }

  // Create a new poll
  createPoll(): void {
    const question = this.newQuestion.trim();

    const options = this.newOptions
      .map(option => option.trim())
      .filter(option => option.length > 0);

    if (!question) {
      alert('Please enter a poll question.');
      return;
    }

    if (options.length < 2) {
      alert('Please provide at least two options.');
      return;
    }

    const poll: PollModel = {
      id: 1,
      question,
      options: options.map(option => ({
        voteOption: option,
        voteCount: 0
      }))
    };

    this.isSubmitting = true;

    this.pollService.createPoll(poll).subscribe({
      next: () => {
        this.newQuestion = '';
        this.newOptions = ['', ''];
        this.isSubmitting = false;

        // Refresh polls after successful creation
        this.loadPolls();
      },
      error: (err) => {
        console.error('Error creating poll:', err);
        this.isSubmitting = false;
        this.cdr.markForCheck();
      }
    });
  }

  // Vote for an option
  vote(pollId: number, optionIndex: number): void {
    this.votingPollId = pollId;

    // 1. Optimistic update: increment vote count immediately so UI reflects change instantly
    const targetPoll = this.polls.find(p => p.id === pollId);
    if (targetPoll && targetPoll.options[optionIndex]) {
      targetPoll.options[optionIndex].voteCount++;
      this.polls = [...this.polls];
      this.cdr.markForCheck();
    }

    // 2. Send vote to backend and re-fetch to sync exact backend state
    this.pollService.vote(pollId, optionIndex).subscribe({
      next: () => {
        this.votingPollId = null;
        // Fetch updated vote counts from server
        this.loadPolls();
      },
      error: (err) => {
        console.error('Error submitting vote:', err);
        this.votingPollId = null;
        // Revert by re-fetching latest state from server
        this.loadPolls();
      }
    });
  }

  // Calculate total votes for one poll
  getTotalVotes(poll: PollModel): number {
    return poll.options.reduce(
      (total, option) => total + option.voteCount,
      0
    );
  }

  // Calculate vote percentage
  getVotePercentage(votes: number, poll: PollModel): number {
    const totalVotes = this.getTotalVotes(poll);

    if (totalVotes === 0) return 0;

    return (votes / totalVotes) * 100;
  }

  // Calculate votes across all polls
  getAllVotes(): number {
    return this.polls.reduce(
      (total, poll) => total + this.getTotalVotes(poll),
      0
    );
  }
}