/**
 * 勤怠管理システム - ログイン・ユーザー登録機能
 * 
 * このファイルには、ログインと新規ユーザー登録に関連する関数が含まれています。
 */

// ログインフォームの初期化
function initLoginForm() {
    const loginForm = getElement('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = getElement('username')?.value;
            const password = getElement('password')?.value;
            
            console.log(`ログイン試行: ${username}`);
            
            // ユーザー認証
            try {
                const users = getUsers();
                const user = users.find(u => u.username === username && u.password === password);
                
                if (user) {
                    console.log(`ユーザー認証成功: ${user.fullName}、ロール: ${user.role}`);
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    
                    if (user.role === 'admin') {
                        showPage('admin');

                        setTimeout(function(){
                            if (typeof initAdminPage === 'function'){
                                console.log('管理者ページを初期化中...');
                                initAdminPage();
                            }else{
                                console.error('initAdminPage関数が見つかりません');
                            }
                        }, 100);
                    } else {
                        showPage('employee');
                        setTimeout(function(){
                            if (typeof initEmployeePage === 'function'){
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
                    if (errorMsg){
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
}

// 登録フォームの初期化
function initRegisterForm() {
    const registerForm = getElement('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = getElement('reg-username')?.value;
            const password = getElement('reg-password')?.value;
            const fullName = getElement('reg-fullname')?.value;
            const role = getElement('reg-role')?.value;
            
            // 入力チェック
            if (!username || !password || !fullName) {
                const msgElement = getElement('register-message');
                if (msgElement) {
                    msgElement.textContent = '全ての項目を入力してください';
                }
                return;
            }
            
            // ユーザー登録処理
            const result = registerUser(username, password, fullName, role);
            
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
        });
    }
    
    // ログイン画面に戻るボタン
    const backToLoginBtn = getElement('back-to-login');
    if (backToLoginBtn) {
        backToLoginBtn.addEventListener('click', function() {
            showPage('login');
        });
    }
}

// DOMが読み込まれた時にログインフォームを初期化
document.addEventListener('DOMContentLoaded', function() {
    // ユーザーの状態を確認
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        // ログインしていない場合、ログイン画面を表示
        showPage('login');
        initLoginForm();
    } else {
        // ログイン済みの場合、適切な画面に遷移
        if (currentUser.role === 'admin') {
            showPage('admin');
        } else {
            showPage('employee');
        }
    }
});
