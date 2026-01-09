import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import './AuthPage.css';

export default function AuthPage() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // Toggle between Login and Sign Up
    const [isLogin, setIsLogin] = useState(true);
    const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                // Successful login will be handled by onAuthStateChange in App.tsx
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        // Optional: meta data like full name if we had that field
                    }
                });
                if (error) throw error;
                setMessage({ type: 'success', text: '登録確認メールを送信しました。リンクをクリックして登録を完了してください。' });
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || '認証エラーが発生しました' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="auth-title">TreLog</h1>
                <p className="auth-subtitle">
                    {isLogin ? 'アカウントにログイン' : '新しいアカウントを作成'}
                </p>

                {message && (
                    <div className={`auth-message ${message.type}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleAuth} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@trelog.com"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            minLength={6}
                            required
                        />
                    </div>

                    <button type="submit" disabled={loading} className="auth-button">
                        {loading ? '処理中...' : (isLogin ? 'ログイン' : '登録する')}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        {isLogin ? 'アカウントをお持ちでないですか？' : 'すでにアカウントをお持ちですか？'}
                    </p>
                    <button
                        type="button"
                        className="text-link"
                        onClick={() => setIsLogin(!isLogin)}
                    >
                        {isLogin ? '新規登録はこちら' : 'ログインはこちら'}
                    </button>
                </div>
            </div>
        </div>
    );
}
