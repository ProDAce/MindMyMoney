import React, { useMemo, useState } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

type CalculatorSheetProps = {
    onSubmit: (value: string) => void;
};

const KEYS: string[][] = [
    ['7', '8', '9', '÷'],
    ['4', '5', '6', '×'],
    ['1', '2', '3', '−'],
    ['%', '0', '.', '+'],
    ['AC', 'OK', '⌫'],
];

const OPERATORS = new Set(['÷', '×', '−', '+']);
const OP_TO_JS: Record<string, string> = { '÷': '/', '×': '*', '−': '-', '+': '+' };
const PRECEDENCE: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2 };

// ---------------------------------------------------------------------------
// Safe expression evaluator (no eval/Function). Supports + - * / and a
// postfix % that divides the number immediately to its left by 100.
// ---------------------------------------------------------------------------

function tokenize(expr: string): string[] {
    const tokens: string[] = [];
    let i = 0;
    while (i < expr.length) {
        const ch = expr[i];
        if (ch === ' ') {
            i++;
            continue;
        }
        if (/[0-9.]/.test(ch)) {
            let num = ch;
            i++;
            while (i < expr.length && /[0-9.]/.test(expr[i])) {
                num += expr[i];
                i++;
            }
            tokens.push(num);
            continue;
        }
        if ('+-*/'.includes(ch)) {
            tokens.push(ch);
            i++;
            continue;
        }
        if (ch === '%') {
            // Postfix: fold "<number> %" into a single number token (num / 100).
            const prev = tokens.pop();
            if (prev !== undefined && !isNaN(Number(prev))) {
                tokens.push(String(Number(prev) / 100));
            }
            i++;
            continue;
        }
        // Unknown character - skip it defensively.
        i++;
    }
    return tokens;
}

function evaluateTokens(tokens: string[]): number | null {
    if (tokens.length === 0) return null;

    // Shunting-yard -> RPN -> evaluate, so × ÷ bind tighter than + −.
    const output: string[] = [];
    const ops: string[] = [];

    for (const tok of tokens) {
        if (!isNaN(Number(tok))) {
            output.push(tok);
        } else if ('+-*/'.includes(tok)) {
            while (
                ops.length &&
                PRECEDENCE[ops[ops.length - 1]] >= PRECEDENCE[tok]
            ) {
                output.push(ops.pop() as string);
            }
            ops.push(tok);
        }
    }
    while (ops.length) output.push(ops.pop() as string);

    const stack: number[] = [];
    for (const tok of output) {
        if (!isNaN(Number(tok))) {
            stack.push(Number(tok));
        } else {
            const b = stack.pop();
            const a = stack.pop();
            if (a === undefined || b === undefined) return null;
            let r: number;
            switch (tok) {
                case '+':
                    r = a + b;
                    break;
                case '-':
                    r = a - b;
                    break;
                case '*':
                    r = a * b;
                    break;
                case '/':
                    r = b === 0 ? NaN : a / b;
                    break;
                default:
                    return null;
            }
            stack.push(r);
        }
    }
    if (stack.length !== 1) return null;
    const result = stack[0];
    return Number.isFinite(result) ? result : null;
}

function formatResult(n: number): string {
    if (!Number.isFinite(n)) return 'Error';
    const rounded = Math.round(n * 1e10) / 1e10;
    return rounded.toString();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CalculatorSheet() {
    const [expression, setExpression] = useState<string>('');

    const liveResult = useMemo(() => {
        if (expression.length === 0) return '';
        const jsExpr = expression
            .split('')
            .map((c) => OP_TO_JS[c] ?? c)
            .join('');
        const trimmed = jsExpr.replace(/[+\-*/.]+$/, ''); // drop trailing dangling op
        if (trimmed.length === 0) return '';
        const value = evaluateTokens(tokenize(trimmed));
        if (value === null) return '';
        return formatResult(value);
    }, [expression]);

    const lastChar = () => expression[expression.length - 1];

    const handleDigit = (d: string) => {
        if (d === '.') {
            // Prevent a second decimal point in the current number segment.
            const segment = expression.split(/[+\-×÷]/).pop() ?? '';
            if (segment.includes('.')) return;
            if (segment.length === 0) {
                setExpression((prev) => prev + '0.');
                return;
            }
        }
        setExpression((prev) => prev + d);
    };

    const handleOperator = (op: string) => {
        setExpression((prev) => {
            if (prev.length === 0) {
                return op === '−' ? '−' : prev; // allow leading minus only
            }
            if (OPERATORS.has(lastChar())) {
                return prev.slice(0, -1) + op; // swap trailing operator
            }
            return prev + op;
        });
    };

    const handlePercent = () => {
        setExpression((prev) => {
            if (prev.length === 0 || OPERATORS.has(lastChar()) || lastChar() === '%') {
                return prev;
            }
            return prev + '%';
        });
    };

    const handleBackspace = () => {
        setExpression((prev) => prev.slice(0, -1));
    };

    const handleClear = () => {
        setExpression('');
    };

    const handleEquals = () => {
        if (!liveResult) return;
        setExpression(liveResult);
    };

    const handlePress = (key: string) => {
        switch (key) {
            case 'AC':
                handleClear();
                break;
            case 'OK':
                handleEquals();
                break;
            case '⌫':
                handleBackspace();
                break;
            case '%':
                handlePercent();
                break;
            case '+':
            case '−':
            case '×':
            case '÷':
                handleOperator(key);
                break;
            default:
                handleDigit(key);
        }
    };

    return (
        <View>
            <View style={styles.display}>
                <Text style={styles.expressionText} numberOfLines={2} adjustsFontSizeToFit>
                    {expression || '0'}
                </Text>
                <Text style={styles.resultText} numberOfLines={1}>
                    {liveResult}
                </Text>
            </View>

            <View style={styles.keypad}>
                {KEYS.map((row, rowIndex) => {
                    const rendered: React.ReactNode[] = [];
                    let c = 0;
                    while (c < row.length) {
                        const key = row[c];
                        // Collapse a horizontally-repeated 'OK' pair into one wide key.
                        // if (key === 'OK' && row[c + 1] === 'OK') {
                        //   rendered.push(
                        //     <KeyButton
                        //       key={`${rowIndex}-${c}`}
                        //       label="OK"
                        //       span={2}
                        //       variant="equals"
                        //       onPress={() => handlePress('OK')}
                        //     />
                        //   );
                        //   c += 2;
                        //   continue;
                        // }
                        rendered.push(
                            <KeyButton
                                key={`${rowIndex}-${c}`}
                                label={key}
                                span={key === 'OK' ? 2 : 1}
                                variant={variantFor(key)}
                                onPress={() => handlePress(key)}
                            />
                        );
                        c += 1;
                    }
                    return (
                        <View key={rowIndex} style={styles.row}>
                            {rendered}
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

function variantFor(key: string): 'digit' | 'operator' | 'function' | 'equals' {
    if (OPERATORS.has(key)) return 'operator';
    if (key === 'AC' || key === '⌫' || key === '%') return 'function';
    return 'digit';
}

// ---------------------------------------------------------------------------
// Key button
// ---------------------------------------------------------------------------

function KeyButton({
    label,
    span,
    variant,
    onPress,
}: {
    label: string;
    span: 1 | 2;
    variant: 'digit' | 'operator' | 'function' | 'equals';
    onPress: () => void;
}) {
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPress}
            style={[
                styles.key,
                span === 2 && styles.keySpan2,
                variant === 'digit' && styles.keyDigit,
                variant === 'operator' && styles.keyOperator,
                variant === 'function' && styles.keyFunction,
                variant === 'equals' && styles.keyEquals,
            ]}
        >
            <Text
                style={[
                    styles.keyLabel,
                    variant === 'operator' && styles.keyLabelOperator,
                    variant === 'equals' && styles.keyLabelEquals,
                    variant === 'function' && styles.keyLabelFunction,
                ]}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}

// ---------------------------------------------------------------------------
// Styles — deep charcoal ground, amber for operators, teal signature on OK.
// ---------------------------------------------------------------------------

const INK = '#14161A';
const PANEL = '#1B1E24';
const KEY_DIGIT = '#21242B';
const KEY_FUNCTION = '#3A3D45';
const ACCENT_OPERATOR = '#FF8A3D';
const ACCENT_EQUALS = '#35D0A0';
const TEXT_PRIMARY = '#F5F3EE';
const TEXT_MUTED = '#8A8F98';

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: INK,
        justifyContent: 'flex-end',
    },
    display: {
        paddingHorizontal: 24,
        paddingTop: 48,
        paddingBottom: 24,
        justifyContent: 'flex-end',
        backgroundColor: PANEL,
    },
    expressionText: {
        color: TEXT_PRIMARY,
        fontSize: 44,
        fontWeight: '300',
        textAlign: 'right',
    },
    resultText: {
        marginTop: 8,
        color: TEXT_MUTED,
        fontSize: 18,
        fontWeight: '500',
        textAlign: 'right',
        minHeight: 22,
    },
    keypad: {
        paddingHorizontal: 12,
        paddingVertical: 16,
        backgroundColor: INK,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    key: {
        flex: 1,
        marginHorizontal: 4,
        height: 68,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: KEY_DIGIT,
    },
    keySpan2: {
        flex: 2,
    },
    keyDigit: {
        backgroundColor: KEY_DIGIT,
    },
    keyOperator: {
        backgroundColor: '#26221D',
        borderWidth: 1.5,
        borderColor: ACCENT_OPERATOR,
    },
    keyFunction: {
        backgroundColor: KEY_FUNCTION,
    },
    keyEquals: {
        backgroundColor: ACCENT_EQUALS,
    },
    keyLabel: {
        fontSize: 24,
        fontWeight: '600',
        color: TEXT_PRIMARY,
    },
    keyLabelOperator: {
        color: ACCENT_OPERATOR,
    },
    keyLabelEquals: {
        color: INK,
        fontWeight: '700',
    },
    keyLabelFunction: {
        color: TEXT_PRIMARY,
        opacity: 0.85,
    },
});