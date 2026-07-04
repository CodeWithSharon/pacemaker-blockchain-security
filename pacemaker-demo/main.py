"""
Pacemaker Blockchain Access Control - Demo Application
======================================================
This application demonstrates how blockchain technology protects pacemakers
from unauthorized access by routing all signals through a secure blockchain wall.

TWO MODES AVAILABLE:
1. BLOCKCHAIN MODE - Connects to real Hardhat blockchain and smart contracts
2. SIMULATION MODE - Runs local Python blockchain simulation
"""

import sys
import time
from datetime import datetime
from utils import print_header, print_success, print_error, print_warning, print_info

def clear_screen():
    """Clear the console screen"""
    import os
    os.system('cls' if os.name == 'nt' else 'clear')

def select_mode():
    """Select demo mode"""
    print_header("=" * 80)
    print_header("  PACEMAKER BLOCKCHAIN ACCESS CONTROL SYSTEM - DEMONSTRATION")
    print_header("=" * 80)
    
    print_info("\n📋 This demo shows how blockchain technology protects pacemakers from:")
    print_info("   • Unauthorized access attempts")
    print_info("   • Malicious command injection")
    print_info("   • Replay attacks")
    print_info("   • Rate limiting violations")
    print_info("   • Command validation failures\n")
    
    print_header("=" * 80)
    print_header("SELECT DEMONSTRATION MODE")
    print_header("=" * 80)
    
    print("\n1. 🔗 BLOCKCHAIN MODE - Connect to real Hardhat blockchain")
    print("   • Interacts with deployed smart contracts")
    print("   • Sends actual blockchain transactions")
    print("   • Requires Hardhat node running")
    print("   • More realistic but slower")
    
    print("\n2. 💻 SIMULATION MODE - Local Python simulation")
    print("   • Simulates blockchain logic locally")
    print("   • Faster demonstrations")
    print("   • No blockchain connection needed")
    print("   • Educational purposes\n")
    
    while True:
        choice = input("Enter your choice (1 or 2): ").strip()
        if choice in ['1', '2']:
            return choice
        print_error("Invalid choice! Please enter 1 or 2.")

def print_welcome(mode=None):
    """Print welcome banner for the selected mode"""
    print_header("=" * 80)
    if mode == '1':
        print_info("  🔗 BLOCKCHAIN MODE - Connecting to real Hardhat blockchain and contracts")
    else:
        print_info("  💻 SIMULATION MODE - Local Blockchain Simulation")
    print_header("=" * 80)
    print()
    time.sleep(1)

def main_menu():
    """Display main menu and handle user input"""
    print_header("\n" + "=" * 80)
    print_header("MAIN MENU")
    print_header("=" * 80)
    print("\n1. 🔒 Demonstrate Authorized Access (Safe Signal)")
    print("2. ❌ Demonstrate Unauthorized Access Attempt")
    print("3. 🎯 Demonstrate Malicious Command Injection")
    print("4. 🔁 Demonstrate Replay Attack Prevention")
    print("5. ⚡ Demonstrate Rate Limiting")
    print("6. 📊 Demonstrate Abnormal Frequency Detection")
    print("7. 🛡️ Run Complete Security Test Suite")
    print("8. 📈 View System Statistics")
    print("9. 🔄 Reset Demo Environment")
    print("0. 🚪 Exit\n")
    
    choice = input("Enter your choice (0-9): ").strip()
    return choice

def main():
    """Main application entry point"""
    clear_screen()
    
    # Select mode
    mode = select_mode()
    print_welcome(mode)
    
    use_blockchain = False
    demo_scenarios = None
    blockchain_wall = None
    signal_simulator = None
    blockchain = None
    
    if mode == '1':
        # Blockchain mode
        try:
            from blockchain_connector import BlockchainConnector
            from blockchain_demo_scenarios import BlockchainDemoScenarios
            
            blockchain = BlockchainConnector()
            demo_scenarios = BlockchainDemoScenarios(blockchain)
            use_blockchain = True
            
        except Exception as e:
            print_error(f"\n❌ Failed to connect to blockchain: {str(e)}")
            print_warning("\nPossible issues:")
            print_warning("   • Hardhat node not running (start with: npx hardhat node)")
            print_warning("   • Wrong RPC URL in .env file")
            print_warning("   • Contracts not deployed")
            print_warning("   • Missing dependencies (run: pip install -r requirements.txt)")
            print_info("\nFalling back to simulation mode...\n")
            input("Press Enter to continue...")
            
            from blockchain_wall import BlockchainWall
            from signal_simulator import SignalSimulator
            from demo_scenarios import DemoScenarios
            
            blockchain_wall = BlockchainWall()
            signal_simulator = SignalSimulator()
            demo_scenarios = DemoScenarios(blockchain_wall, signal_simulator)
            use_blockchain = False
    else:
        # Simulation mode
        from blockchain_wall import BlockchainWall
        from signal_simulator import SignalSimulator
        from demo_scenarios import DemoScenarios
        
        blockchain_wall = BlockchainWall()
        signal_simulator = SignalSimulator()
        demo_scenarios = DemoScenarios(blockchain_wall, signal_simulator)
        use_blockchain = False
    
    while True:
        choice = main_menu()
        
        if choice == '1':
            clear_screen()
            demo_scenarios.demo_authorized_access()
            
        elif choice == '2':
            clear_screen()
            demo_scenarios.demo_unauthorized_access()
            
        elif choice == '3':
            clear_screen()
            demo_scenarios.demo_malicious_command_injection()
            
        elif choice == '4':
            clear_screen()
            demo_scenarios.demo_replay_attack()
            
        elif choice == '5':
            clear_screen()
            demo_scenarios.demo_rate_limiting()
            
        elif choice == '6':
            clear_screen()
            demo_scenarios.demo_abnormal_frequency()
            
        elif choice == '7':
            clear_screen()
            demo_scenarios.run_complete_test_suite()
            
        elif choice == '8':
            clear_screen()
            demo_scenarios.show_statistics()
            print_info("\n💡 Tip: These metrics can be used in your research paper's Results section!")
            
        elif choice == '9':
            clear_screen()
            print_warning("\n🔄 Resetting demo environment...")
            if use_blockchain:
                print_info("Note: Blockchain state cannot be reset without redeploying contracts.")
                print_info("Transaction counters and gas usage will be reset locally.\n")
                try:
                    from blockchain_connector import BlockchainConnector
                    from blockchain_demo_scenarios import BlockchainDemoScenarios
                    blockchain = BlockchainConnector()
                    demo_scenarios = BlockchainDemoScenarios(blockchain)
                except Exception:
                    print_error("Failed to reconnect to blockchain.")
            else:
                from blockchain_wall import BlockchainWall
                from signal_simulator import SignalSimulator
                from demo_scenarios import DemoScenarios
                blockchain_wall = BlockchainWall()
                signal_simulator = SignalSimulator()
                demo_scenarios = DemoScenarios(blockchain_wall, signal_simulator)
            print_success("✅ Demo environment reset successfully!\n")
            time.sleep(1)
            
        elif choice == '0':
            clear_screen()
            print_success("\n👋 Thank you for exploring the Pacemaker Blockchain Access Control Demo!")
            print_info("Stay safe and secure! 🔒\n")
            sys.exit(0)
            
        else:
            print_error("\n❌ Invalid choice! Please enter a number between 0-9.\n")
        
        input("\n Press Enter to continue...")
        clear_screen()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        clear_screen()
        print_warning("\n\n⚠️  Demo interrupted by user.")
        print_success("👋 Thank you for exploring the Pacemaker Blockchain Access Control Demo!\n")
        sys.exit(0)
    except Exception as e:
        print_error(f"\n❌ An error occurred: {str(e)}\n")
        sys.exit(1)