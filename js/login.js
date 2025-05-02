/**
 * 勤怠管理システム - ログイン・ユーザー登録機能 (シンプル版)
 */

// ログインフォームの初期化
function initLoginForm() {
    console.log('ログインフォーム初期化 (シンプル版)');
    
    // 初期ユーザーの確認
    setupInitialUsers();
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            
            // 直接ローカルストレージからユーザー検索
            let users = [];
            try {
                const data = localStorage.getItem('users');
                if (data) {
                    users = JSON.parse(data);
                }
            } catch (e) {
                console.error('ユーザーデータエラー:', e);
            }
            
            // ユーザー認証
            const user = users.find(u => u.username === username && u.password === password);
            if (user) {
                // ログイン成功
                localStorage.setItem('currentUser', JSON.stringify(user));
                
                if (user.role === 'admin') {
                    document.getElementById('login-page').classList.add('hidden');
                    document.getElementById('admin-page').classList.remove('hidden');
                    
                    setTimeout(function() {
                        if (typeof initAdminPage === 'function') {
                            initAdminPage();
                        }
                    }, 200);
                } else {
                    document.getElementById('login-page').classList.add('hidden');
                    document.getElementById('employee-page').classList.remove('hidden');
                    
                    setTimeout(function() {
                        if (typeof initEmployeePage === 'function') {
                            initEmployeePage();
                        }
                    }, 200);
                }
            } else {
                // ログイン失敗
                const errorMsg = document.getElementById('error-message');
                if (errorMsg) {
                    errorMsg.textContent = 'ユーザーIDまたはパスワードが正しくありません';
                }
            }
        });
    }
    
    // 新規登録リンク
    const registerBtn = document.getElementById('go-to-register');
    if (registerBtn) {
        registerBtn.addEventListener('click', function() {
            document.getElementById('login-page').classList.add('hidden');
            document.getElementById('register-page').classList.remove('hidden');
        });
    }
    
    // 登録フォーム初期化
    initSimpleRegisterForm();
}

// 非常にシンプルな登録フォーム初期化
function initSimpleRegisterForm() {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('reg-username').value.trim();
            const password = document.getElementById('reg-password').value.trim();
            const fullName = document.getElementById('reg-fullname').value.trim();
            const role = document.getElementById('reg-role').value;
            
            const msgEl = document.getElementById('register-message');
            
            // 入力チェック
            if (!username || !password || !fullName) {
                if (msgEl) {
                    msgEl.textContent = '全ての項目を入力してください';
                    msgEl.style.color = '#F44336'; // 赤色で表示
                }
                return;
            }
            
            // 直接ユーザー登録処理
            let users = [];
            try {
                const data = localStorage.getItem('users');
                if (data) {
                    users = JSON.parse(data);
                }
            } catch (e) {
                console.error('ユーザーデータ読み取りエラー:', e);
                users = [];
            }
            
            // ユーザー登録処理部分
            if (users.some(u => u.username === username)) {
                // 重複の場合
                if (msgEl) {
                    msgEl.textContent = 'このユーザーIDは既に使用されています';
                    msgEl.style.color = '#F44336'; // 赤色
                }
            } else {
                // 重複がなく登録成功の場合
                const newId = users.length > 0 ? Math.max(...users.map(u => Number(u.id) || l)) + 1 : 1;
                const newUser = {
                    id: newId,
                    username: username,
                    password: password,
                    fullName: fullName,
                    role: role || 'employee'
                };
    
                // 追加して保存
                users.push(newUser);
                localStorage.setItem('users', JSON.stringify(users));
                console.log('新規ユーザーを登録しました:', newUser);
    
                // 成功メッセージを明確に表示
                if (msgEl) {
                    msgEl.textContent = '登録が完了しました！ログイン画面に戻ります...';
                    msgEl.style.color = '#4CAF50'; // 緑色
        
                    // 3秒後にログイン画面へ
                    setTimeout(() => {
                        document.getElementById('register-page').classList.add('hidden');
                        document.getElementById('login-page').classList.remove('hidden');
                        registerForm.reset();
                        msgEl.textContent = '';
                        msgEl.style.color = '';
                    }, 3000);
                }
            }
        });
    }
    
    // 戻るボタン
    const backBtn = document.getElementById('back-to-login');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            document.getElementById('register-page').classList.add('hidden');
            document.getElementById('login-page').classList.remove('hidden');
            // フォームとメッセージをリセット
            const registerForm = document.getElementById('registerForm');
            if (registerForm) registerForm.reset();
            
            const msgEl = document.getElementById('register-message');
            if (msgEl) {
                msgEl.textContent = '';
                msgEl.style.color = '';
            }
        });
    }
}

// 初期ユーザーを確実に設定
function setupInitialUsers() {
    try {
        const data = localStorage.getItem('users');
        if (!data) {
            const initialUsers = [
                {
                    id: 1,
                    username: 'admin',
                    password: 'admin',
                    fullName: '管理者',
                    role: 'admin'
                },
                {
                    id: 2,
                    username: 'employee',
                    password: 'employee',
                    fullName: '山田太郎',
                    role: 'employee'
                }
            ];
            localStorage.setItem('users', JSON.stringify(initialUsers));
            console.log('初期ユーザーを作成しました');
        }
    } catch (e) {
        console.error('初期ユーザー設定エラー:', e);
    }
}

// DOMが読み込まれた時にログインフォームを初期化
document.addEventListener('DOMContentLoaded', function() {
    // 画面初期表示
    document.querySelectorAll('#login-page, #employee-page, #admin-page, #register-page')
        .forEach(el => el.classList.add('hidden'));
        
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        document.getElementById('login-page').classList.remove('hidden');
        initLoginForm();
    } else {
        if (currentUser.role === 'admin') {
            document.getElementById('admin-page').classList.remove('hidden');
            setTimeout(() => {
                if (typeof initAdminPage === 'function') initAdminPage();
            }, 200);
        } else {
            document.getElementById('employee-page').classList.remove('hidden');
            setTimeout(() => {
                if (typeof initEmployeePage === 'function') initEmployeePage();
            }, 200);
        }
    }
});
