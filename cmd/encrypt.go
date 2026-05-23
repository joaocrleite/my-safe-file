package cmd

import (
	"fmt"

	"github.com/joaocrleite/my-safe-file/internal/crypto"
	"github.com/spf13/cobra"
)

var encryptCmd = &cobra.Command{
	Use:   "encrypt <text>",
	Short: "Encrypt a text with a password",
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		password, _ := cmd.Flags().GetString("password")

		result, err := crypto.Encrypt(args[0], password, crypto.DefaultConfig)
		if err != nil {
			return err
		}

		fmt.Println(result)
		return nil
	},
}

func init() {
	encryptCmd.Flags().StringP("password", "p", "", "Password used to encrypt (required)")
	encryptCmd.MarkFlagRequired("password")
	rootCmd.AddCommand(encryptCmd)
}
