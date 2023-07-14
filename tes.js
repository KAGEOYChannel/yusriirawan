// Fungsi enkripsi dengan AES
function encryptAES(data, key) {
  var encrypted = CryptoJS.AES.encrypt(data, key);
  return encrypted.toString();
}

// Fungsi dekripsi dengan AES
function decryptAES(encryptedData, key) {
  var decrypted = CryptoJS.AES.decrypt(encryptedData, key);
  return decrypted.toString(CryptoJS.enc.Utf8);
}

// Fungsi checkPassword() yang telah dienkripsi
var encryptedFunction = 'U2FsdGVkX19y4tUd7sNt2z3BICv11k3E/RZ6wjFwDRrVKaBWIclpMi3KpUBP8FwR';
var encryptedPassword = 'U2FsdGVkX18SyhSQoH/zlc/F6H5ts4k5yOvJc5OkzLtCUnv49CGaIjpkOQs8D8BM';

function checkPassword() {
  var password = document.getElementById("password").value;

  // Mengganti PASSWORD yang diinginkan dengan password yang benar (dalam bentuk terenkripsi)
  var correctPassword = decryptAES(encryptedPassword, "MySecretKey");

  if (password === correctPassword) {
    window.location.href = "rahasia.html";
  } else {
    swal("Password Salah", "Silakan coba lagi!", "error");
  }
}

// Mendekripsi dan menjalankan fungsi checkPassword()
eval(decryptAES(encryptedFunction, "MySecretKey"));
