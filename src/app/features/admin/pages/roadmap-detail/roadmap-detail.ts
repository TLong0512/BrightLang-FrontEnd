import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import Sortable from 'sortablejs';

interface Lesson {
    id: number;
    type: string;
    name: string;
    days: number;
    sentences: number;
}

@Component({
    selector: 'roadmap-detail',
    templateUrl: './roadmap-detail.html',
    styleUrls: ['./roadmap-detail.css'],
    imports: [ReactiveFormsModule, CommonModule],
    standalone: true,
})
export class RoadMapDetailComponent implements OnInit, AfterViewInit {
    lessons: Lesson[] = [
        { id: 1, type: 'Practice', name: 'Dạng câu 9-10: Tìm nghĩa phần phù hợp', days: 50, sentences: 30 },
        { id: 2, type: 'Theory', name: 'Ngữ pháp cơ bản', days: 50, sentences: 30 },
        { id: 3, type: 'Test', name: 'Bài kiểm tra số 1', days: 50, sentences: 30 },
    ];

    formGroups: { [key: number]: FormGroup } = {};

    constructor(private fb: FormBuilder) { }

    ngOnInit(): void {
        // Tạo form group cho từng lesson
        this.lessons.forEach(lesson => {
            this.formGroups[lesson.id] = this.fb.group({
                days: [lesson.days],
                sentences: [lesson.sentences]
            });
        });
    }

    ngAfterViewInit(): void {
        // Simple check for browser environment
        if (typeof document !== 'undefined') {
            this.initializeSortable();
        }
    }

    private initializeSortable(): void {
        const el = document.getElementById('lessonAccordion');
        if (!el) return;

        new Sortable(el, {
            animation: 200,
            ghostClass: 'dragging',
            draggable: '.accordion-item',
            handle: '.lesson-btn', // optional, chỉ kéo khi bấm header
            onEnd: (evt) => {
                // Optional: cập nhật thứ tự lessons array sau khi kéo
                const oldIndex = evt.oldIndex!;
                const newIndex = evt.newIndex!;
                const moved = this.lessons.splice(oldIndex, 1)[0];
                this.lessons.splice(newIndex, 0, moved);
                console.log('Mảng lessons sau khi kéo:', this.lessons);
            }
        });
    }

    getData() {
        const data = this.lessons.map(lesson => {
            const fg = this.formGroups[lesson.id];
            return {
                id: lesson.id,
                type: lesson.type,
                name: lesson.name,
                days: fg.get('days')?.value,
                sentences: fg.get('sentences')?.value
            };
        });
        console.log('Dữ liệu theo thứ tự giao diện:', data);
    }

    getControl(lessonId: number, controlName: 'days' | 'sentences'): FormControl {
        return this.formGroups[lessonId].get(controlName) as FormControl;
    }
}