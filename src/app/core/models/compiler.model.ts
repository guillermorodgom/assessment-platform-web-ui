export interface TestCaseDto {
  input: string;
  expectedOutput: string;
}

export interface CompilerRequest {
  sourceCode: string;
  language: string;
  testCases: TestCaseDto[];
}

export interface TestResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
}

export interface CompilerResponse {
  success: boolean;
  output: string;
  error: string;
  testResults: TestResult[];
}
