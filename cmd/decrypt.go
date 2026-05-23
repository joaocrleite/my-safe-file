package cmd

import (
	"fmt"

	"github.com/joaocrleite/my-safe-file/internal/crypto"
	"github.com/spf13/cobra"
)

var decryptCmd = &cobra.Command{
	Use:   "decrypt <ciphertext>",
	Short: "Decrypt a ciphertext with a password",
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		password, _ := cmd.Flags().GetString("password")

		result, err := crypto.Decrypt(args[0], password, crypto.DefaultConfig)
		if err != nil {
			return err
		}

		fmt.Println(result)
		return nil
	},
}

func init() {
	decryptCmd.Flags().StringP("password", "p", "", "Password used to decrypt (required)")
	decryptCmd.MarkFlagRequired("password")
	rootCmd.AddCommand(decryptCmd)
}
