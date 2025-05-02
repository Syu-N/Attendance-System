/**
 * 勤怠管理システム - ログイン・ユーザー登録機能
 * 
 * このファイルには、ログインと新規ユーザー登録に関連する関数が含まれています。
 */

// ログインフォームの初期化
function initLoginForm() {
    console.log('ログインフォームの初期化開始');
    
    const loginForm = getElement('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = getElement('username')?.value.trim();
            const password = getElement('password')?.value.trim();
            
            console.log(`ログイン試行: ${username}`);
            
            // ユーザー認証
            try {
                const users = getUsers();
                console.log('取得したユーザー一覧:', users);
                
                const user = users.find(u => u.username === username && u.password === password);
                
                if (user) {
                    console.log(`ユーザー認証成功: ${user.fullName}、ロール: ${user.role}`);
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    
                    if (user.role === 'admin') {
                        showPage('admin');
                        
                        setTimeout(function() {
                            if (typeof initAdminPage === 'function') {
                                console.log('管理者ページを初期化中...');
                                initAdminPage();
                            } else {
                                console.error('initAdminPage関数が見つかりません');
                            }
                        }, 100);
                    } else {
                        showPage('employee');
                        
                        setTimeout(function() {
                            if (typeof initEmployeePage === 'function') {
                                console.log('従業員ページを初期化中...');
                                initEmployeePage();
                            } else {
                                console.error('initEmployeePage関数が見つかりません');
                            }
                        }, 100);
                    }
                } else {
                    console.log('ユーザー認証失敗');
                    const errorMsg = getElement('error-message');
                    if (errorMsg) {
                        errorMsg.textContent = 'ユーザーIDまたはパスワードが正しくありません';
                    }
                }
            } catch (error) {
                console.error('認証エラー:', error);
                const errorMsg = getElement('error-message');
                if (errorMsg) {
                    errorMsg.textContent = 'ログイン処理中にエラーが発生しました';
                }
            }
        });
    }
    
    // 新規登録リンク
    const goToRegisterBtn = getElement('go-to-register');
    if (goToRegisterBtn) {
        goToRegisterBtn.addEventListener('click', function() {
            showPage('register');
        });
    }
    
    // 登録フォーム初期化
    initRegisterForm();
    
    console.log('ログインフォームの初期化完了');
}

// 登録フォームの初期化
function initRegisterForm() {
    console.log('登録フォームの初期化開始');
    
    const registerForm = getElement('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('登録フォーム送信');
            
            try {
                const username = getElement('reg-username')?.value.trim() || '';
                const password = getElement('reg-password')?.value.trim() || '';
                const fullName = getElement('reg-fullname')?.value.trim() || '';
                const role = getElement('reg-role')?.value || 'employee';
                
                console.log('登録情報:', username, fullName, role);
                
                // 入力チェック
                if (!username || !password || !fullName) {
                    const msgElement = getElement('register-message');
                    if (msgElement) {
                        msgElement.textContent = '全ての項目を入力してください';
                    }
                    return;
                }
                
                // ユーザー登録処理
                console.log('登録処理を実行します');
                const result = customRegisterUser(username, password, fullName, role);
                console.log('登録結果:', result);
                
                const msgElement = getElement('register-message');
                if (msgElement) {
                    msgElement.textContent = result.message;
                    
                    if (result.success) {
                        msgElement.style.color = '#4CAF50'; // 成功メッセージは緑色
                        
                        // 3秒後にログイン画面へ
                        setTimeout(() => {
                            showPage('login');
                            // フォームをクリア
                            registerForm.reset();
                            msgElement.textContent = '';
                            msgElement.style.color = '';
                        }, 3000);
                    }
                }
            } catch (error) {
                console.error('登録処理エラー:', error);
                const msgElement = getElement('register-message');
                if (msgElement) {
                    msgElement.textContent = '登録処理中にエラーが発生しました: ' + error.message;
                }
            }
        });
    }
    
    // ログイン画面に戻るボタン
    const backToLoginBtn = getElement('back-to-login');
    if (backToLoginBtn) {
        backToLoginBtn.addEventListener('click', function() {
            showPage('login');
        });
    }
    
    console.log('登録フォームの初期化完了');
}

/**
 * カスタムユーザー登録関数
 * utils.jsのregisterUser関数を使わず直接ユーザー登録処理を行う
 */
function customRegisterUser(username, password, fullName, role) {
    console.log('カスタム登録関数開始:', username);
    
    try {
        // ローカルストレージから直接ユーザー取得
        const usersJSON = localStorage.getItem('users');
        let users = [];
        
        if (usersJSON) {
            try {
                users = JSON.parse(usersJSON);
                console.log('既存ユーザー取得成功。ユーザー数:', users.length);
            } catch (e) {
                console.error('ユーザーJSONの解析エラー:', e);
                users = [];
            }
        } else {
            console.log('ユーザーデータがありません。新規作成します');
        }
        
        // ユーザー重複チェック
        const existingUser = users.find(u => u.username === username);
        if (existingUser) {
            console.log('重複ユーザー検出:', existingUser);
            return {
                success: false,
                message: 'このユーザーIDは既に使用されています'
            };
        }
        
        // 新規ID生成
        let newId = 1;
        if (users.length > 0) {
            const ids = users.map(u => Number(u.id) || 0);
            newId = Math.max(...ids) + 1;
            console.log('新規ID生成:', newId, '(既存ID:', ids, ')');
        }
        
        // 新規ユーザー作成
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
        
        console.log('ユーザー登録完了。ID:', newId, 'ユーザー名:', username);
        console.log('保存後のユーザー一覧:', users);
        
        return {
            success: true,
            message: '登録が完了しました',
            user: newUser
        };
    } catch (error) {
        console.error('登録処理中にエラーが発生しました:', error);
        return {
            success: false,
            message: '登録処理中にエラーが発生しました: ' + error.message
        };
    }
}

// DOMが読み込まれた時にログインフォームを初期化
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMコンテンツロード完了');
    
    try {
        // ユーザーの状態を確認
        const currentUser = getCurrentUser();
        console.log('現在のユーザー:', currentUser);
        
        // デフォルトユーザーのチェックと初期化
        checkAndInitializeDefaultUsers();
        
        if (!currentUser) {
            // ログインしていない場合、ログイン画面を表示
            console.log('未ログイン状態のためログイン画面を表示');
            showPage('login');
            initLoginForm();
        } else {
            // ログイン済みの場合、適切な画面に遷移
            console.log('ログイン済み。ユーザーロール:', currentUser.role);
            if (currentUser.role === 'admin') {
                showPage('admin');
                setTimeout(function() {
                    if (typeof initAdminPage === 'function') {
                        console.log('管理者ページを初期化中...');
                        initAdminPage();
                    }
                }, 100);
            } else {
                showPage('employee');
                setTimeout(function() {
                    if (typeof initEmployeePage === 'function') {
                        console.log('従業員ページを初期化中...');
                        initEmployeePage();
                    }
                }, 100);
            }
        }
    } catch (error) {
        console.error('初期化中にエラー発生:', error);
        // エラー発生時はログイン画面を表示
        showPage('login');
        initLoginForm();
    }
});

/**
 * デフォルトユーザーの確認と初期化
 * ユーザーデータが存在しない場合、初期ユーザーを作成
 */
function checkAndInitializeDefaultUsers() {
    const usersJSON = localStorage.getItem('users');
    
    if (!usersJSON) {
        console.log('ユーザーデータが見つかりません。初期ユーザーを作成します');
        
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
        console.log('初期ユーザーを作成しました:', initialUsers);
    } else {
        try {
            const users = JSON.parse(usersJSON);
            console.log('既存ユーザーを読み込みました。ユーザー数:', users.length);
        } catch (e) {
            console.error('不正なユーザーデータをリセットします:', e);
            
            // 不正なJSONの場合、初期化する
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
            console.log('初期ユーザーを再作成しました');
        }
    }
}
