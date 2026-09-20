import { Component, Input, OnInit, OnChanges, SimpleChanges, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { PanelModule } from 'primeng/panel';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { timeout, catchError, of } from 'rxjs';
import { CompilerHttpService } from '../../../../core/services/compiler-http.service';
import { IntentoHttpService } from '../../../../core/services/intento-http.service';
import { ExamStateService } from '../../../../core/services/exam-state.service';
import { PreguntaResponse, CompilerResponse, TestResult } from '../../../../core/models';
import { LenguajeProgramacion } from '../../../../core/models/enums.model';

@Component({
  selector: 'app-pregunta-codigo',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MonacoEditorModule, PanelModule,
    DropdownModule, ButtonModule, TabViewModule, TagModule, ToastModule
  ],
  templateUrl: './pregunta-codigo.component.html'
})
export class PreguntaCodigoComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() pregunta!: PreguntaResponse;
  @Input() intentoId!: number;

  code = '';
  selectedLanguage: LenguajeProgramacion;
  editorOptions: any;
  editorReady = false;

  executing = false;
  submitting = false;
  submitted = false;

  consoleOutput = '';
  consoleError = '';
  testResults: TestResult[] = [];
  activeTabIndex = 0;

  private editorInstance: any;

  private readonly allLenguajeOptions = [
    { label: 'Java', value: LenguajeProgramacion.JAVA },
    { label: 'JavaScript', value: LenguajeProgramacion.JAVASCRIPT },
    { label: 'Python', value: LenguajeProgramacion.PYTHON }
  ];

  lenguajeOptions: { label: string; value: LenguajeProgramacion }[] = [];

  private readonly TIMEOUT_MS = 30000;

  constructor(
    private compilerService: CompilerHttpService,
    private intentoService: IntentoHttpService,
    private examState: ExamStateService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {
    this.selectedLanguage = LenguajeProgramacion.JAVA;
    this.editorOptions = this.getEditorOptions('java');
  }

  ngOnInit(): void {
    this.loadPreguntaState();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pregunta'] && !changes['pregunta'].firstChange) {
      this.loadPreguntaState();
    }
  }

  private loadPreguntaState(): void {
    // Reset component state
    this.code = '';
    this.executing = false;
    this.submitting = false;
    this.submitted = false;
    this.consoleOutput = '';
    this.consoleError = '';
    this.testResults = [];
    this.activeTabIndex = 0;

    // Filter dropdown to only allowed languages
    const permitidos = this.pregunta.lenguajesPermitidos || [];
    this.lenguajeOptions = permitidos.length > 0
      ? this.allLenguajeOptions.filter(o => permitidos.includes(o.value))
      : [...this.allLenguajeOptions];

    this.selectedLanguage = this.lenguajeOptions[0]?.value || LenguajeProgramacion.JAVA;
    this.updateEditorOptions();

    const saved = this.examState.getAnswer(this.pregunta.id);
    if (saved) {
      this.code = saved.codigoFuente || '';
      if (saved.lenguaje) {
        this.selectedLanguage = saved.lenguaje as LenguajeProgramacion;
        this.updateEditorOptions();
      }
      if (saved.submitted) {
        this.submitted = true;
      }
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.editorReady = true;
      this.cdr.detectChanges();
    });
  }

  onEditorInit(editor: any): void {
    this.editorInstance = editor;
    setTimeout(() => editor.layout(), 100);
  }

  onLanguageChange(): void {
    this.updateEditorOptions();
    this.saveLocal();
  }

  onCodeChange(): void {
    this.saveLocal();
  }

  private saveLocal(): void {
    this.examState.updateAnswer(this.pregunta.id, {
      codigoFuente: this.code,
      lenguaje: this.selectedLanguage
    });
  }

  ejecutar(): void {
    if (!this.code.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Vacio', detail: 'Escribe codigo antes de ejecutar' });
      return;
    }

    this.executing = true;
    this.consoleOutput = '';
    this.consoleError = '';
    this.testResults = [];

    const testCases = (this.pregunta.casosDePrueba || []).map(tc => ({
      input: tc.input || '',
      expectedOutput: tc.expectedOutput
    }));

    this.compilerService.execute({
      sourceCode: this.code,
      language: this.selectedLanguage,
      testCases
    }).pipe(
      timeout(this.TIMEOUT_MS),
      catchError(err => {
        if (err.name === 'TimeoutError') {
          return of({
            success: false,
            output: '',
            error: 'Tiempo de ejecucion excedido (timeout de 30s)',
            testResults: []
          } as CompilerResponse);
        }
        return of({
          success: false,
          output: '',
          error: err.error?.message || 'Error al ejecutar el codigo',
          testResults: []
        } as CompilerResponse);
      })
    ).subscribe(result => {
      this.executing = false;
      this.consoleOutput = result.output || '';
      this.consoleError = result.error || '';
      this.testResults = result.testResults || [];
      this.activeTabIndex = this.testResults.length > 0 ? 1 : 0;
    });
  }

  enviarRespuesta(): void {
    if (!this.code.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Vacio', detail: 'Escribe codigo antes de enviar' });
      return;
    }

    this.submitting = true;
    this.intentoService.enviarRespuesta(this.intentoId, {
      preguntaId: this.pregunta.id,
      codigoFuente: this.code,
      lenguaje: this.selectedLanguage
    }).subscribe({
      next: resultado => {
        this.submitting = false;
        this.submitted = true;
        this.examState.markSubmitted(this.pregunta.id, resultado);
        this.messageService.add({
          severity: 'success',
          summary: 'Respuesta enviada',
          detail: 'Tu respuesta ha sido guardada. Veras el resultado al finalizar.'
        });
      },
      error: () => {
        this.submitting = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo enviar la respuesta' });
      }
    });
  }

  private updateEditorOptions(): void {
    this.editorOptions = this.getEditorOptions(this.getMonacoLanguage());
  }

  private getEditorOptions(language: string): any {
    return {
      theme: 'vs-dark',
      language,
      minimap: { enabled: false },
      automaticLayout: true,
      fontSize: 14,
      scrollBeyondLastLine: false,
      lineNumbers: 'on',
      tabSize: 2
    };
  }

  private getMonacoLanguage(): string {
    switch (this.selectedLanguage) {
      case LenguajeProgramacion.JAVA: return 'java';
      case LenguajeProgramacion.JAVASCRIPT: return 'javascript';
      case LenguajeProgramacion.PYTHON: return 'python';
      default: return 'plaintext';
    }
  }
}
