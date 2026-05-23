package crypto

import (
	"os"
	"strings"
	"testing"
)

// fastConfig uses minimal Argon2id params to keep tests fast.
var fastConfig = Config{
	Argon2Time:    1,
	Argon2Memory:  1024,
	Argon2Threads: 1,
}

func TestEncryptDecrypt(t *testing.T) {
	tests := []struct {
		name      string
		plaintext string
		password  string
	}{
		{"simple text", "hello world", "mypassword"},
		{"special characters", "!@#$%^&*()_+-=[]{}|;':\",./<>?", "p@ssw0rd!"},
		{"unicode text", "Olá, mundo! 🔐 Γειά σου", "senha123"},
		{"long text", strings.Repeat("Go encryption test. ", 100), "longpassword"},
		{"empty text", "", "password"},
		{"multiline text", "line one\nline two\nline three", "secret"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			encrypted, err := Encrypt(tt.plaintext, tt.password, fastConfig)
			if err != nil {
				t.Fatalf("Encrypt() error = %v", err)
			}

			decrypted, err := Decrypt(encrypted, tt.password, fastConfig)
			if err != nil {
				t.Fatalf("Decrypt() error = %v", err)
			}

			if decrypted != tt.plaintext {
				t.Errorf("got %q, want %q", decrypted, tt.plaintext)
			}
		})
	}
}

func TestEncryptProducesUniqueOutputs(t *testing.T) {
	plaintext := "same text"
	password := "same password"

	first, err := Encrypt(plaintext, password, fastConfig)
	if err != nil {
		t.Fatalf("first Encrypt() error = %v", err)
	}

	second, err := Encrypt(plaintext, password, fastConfig)
	if err != nil {
		t.Fatalf("second Encrypt() error = %v", err)
	}

	if first == second {
		t.Error("two encryptions of the same text produced identical output (random salt/nonce not working)")
	}
}

func TestDecryptWithWrongPassword(t *testing.T) {
	encrypted, err := Encrypt("secret message", "correct-password", fastConfig)
	if err != nil {
		t.Fatalf("Encrypt() error = %v", err)
	}

	_, err = Decrypt(encrypted, "wrong-password", fastConfig)
	if err == nil {
		t.Error("expected error when decrypting with wrong password, got nil")
	}
}

func TestDecryptWithInvalidBase64(t *testing.T) {
	_, err := Decrypt("not-valid-base64!!!", "password", fastConfig)
	if err == nil {
		t.Error("expected error for invalid base64 input, got nil")
	}
}

func TestDecryptWithTruncatedData(t *testing.T) {
	_, err := Decrypt("aGVsbG8=", "password", fastConfig) // "hello" in base64, too short
	if err == nil {
		t.Error("expected error for truncated ciphertext, got nil")
	}
}

func TestEncryptDecryptFile(t *testing.T) {
	original, err := os.ReadFile("../../testData/sample.txt")
	if err != nil {
		t.Fatalf("could not read testData/sample.txt: %v", err)
	}

	encrypted, err := Encrypt(string(original), "filepassword", fastConfig)
	if err != nil {
		t.Fatalf("Encrypt() error = %v", err)
	}

	if encrypted == string(original) {
		t.Fatal("encrypted output must differ from original content")
	}

	decrypted, err := Decrypt(encrypted, "filepassword", fastConfig)
	if err != nil {
		t.Fatalf("Decrypt() error = %v", err)
	}

	if decrypted != string(original) {
		t.Errorf("decrypted content does not match original\ngot:  %q\nwant: %q", decrypted, string(original))
	}
}

func TestDecryptWithTamperedCiphertext(t *testing.T) {
	encrypted, err := Encrypt("original message", "password", fastConfig)
	if err != nil {
		t.Fatalf("Encrypt() error = %v", err)
	}

	// Flip the last character to tamper with the ciphertext.
	tampered := encrypted[:len(encrypted)-1] + "X"
	if tampered[len(tampered)-1] == encrypted[len(encrypted)-1] {
		tampered = encrypted[:len(encrypted)-1] + "Y"
	}

	_, err = Decrypt(tampered, "password", fastConfig)
	if err == nil {
		t.Error("expected error for tampered ciphertext, got nil")
	}
}
