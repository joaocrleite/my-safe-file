package crypto

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"io"

	"golang.org/x/crypto/argon2"
)

const (
	saltSize  = 16
	nonceSize = 12
	keySize   = 32
)

// Config holds the Argon2id key derivation parameters.
type Config struct {
	Argon2Time    uint32
	Argon2Memory  uint32
	Argon2Threads uint8
}

// DefaultConfig uses recommended Argon2id parameters for interactive use.
var DefaultConfig = Config{
	Argon2Time:    1,
	Argon2Memory:  64 * 1024,
	Argon2Threads: 4,
}

// Encrypt encrypts plaintext with the given password using AES-256-GCM.
// Returns a base64-encoded string containing: salt (16 bytes) + nonce (12 bytes) + ciphertext.
func Encrypt(plaintext, password string, cfg Config) (string, error) {
	salt := make([]byte, saltSize)
	if _, err := io.ReadFull(rand.Reader, salt); err != nil {
		return "", err
	}

	key := deriveKey(password, salt, cfg)

	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonce := make([]byte, nonceSize)
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}

	ciphertext := gcm.Seal(nil, nonce, []byte(plaintext), nil)

	result := make([]byte, saltSize+nonceSize+len(ciphertext))
	copy(result[:saltSize], salt)
	copy(result[saltSize:saltSize+nonceSize], nonce)
	copy(result[saltSize+nonceSize:], ciphertext)

	return base64.StdEncoding.EncodeToString(result), nil
}

// Decrypt decrypts a base64-encoded ciphertext produced by Encrypt.
// Returns an error if the password is wrong or the data is corrupted.
func Decrypt(encoded, password string, cfg Config) (string, error) {
	data, err := base64.StdEncoding.DecodeString(encoded)
	if err != nil {
		return "", errors.New("invalid ciphertext format")
	}

	if len(data) < saltSize+nonceSize {
		return "", errors.New("ciphertext too short")
	}

	salt := data[:saltSize]
	nonce := data[saltSize : saltSize+nonceSize]
	ciphertext := data[saltSize+nonceSize:]

	key := deriveKey(password, salt, cfg)

	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", errors.New("decryption failed: wrong password or corrupted data")
	}

	return string(plaintext), nil
}

func deriveKey(password string, salt []byte, cfg Config) []byte {
	return argon2.IDKey([]byte(password), salt, cfg.Argon2Time, cfg.Argon2Memory, cfg.Argon2Threads, keySize)
}
