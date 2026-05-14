import re
import sys

def validate_ucla_email(email):
    pattern = r'^[a-zA-Z0-9_.+-]+@([a-zA-Z0-9-]+\.)*ucla\.edu$'
    return bool(re.match(pattern, email))

def run_tests():
    test_cases = [
        # Valid UCLA emails
        ("joebruin@ucla.edu", True),
        ("joebruin@g.ucla.edu", True),
        ("j.bruin@cs.ucla.edu", True),
        ("joe_bruin+test@math.ucla.edu", True),
        ("joe.bruin123@mednet.ucla.edu", True),
        ("student@law.ucla.edu", True),
        
        # Invalid UCLA emails (wrong domain)
        ("joebruin@gmail.com", False),
        ("joebruin@ucla.com", False),
        ("joebruin@ucla.edu.org", False),
        ("joebruin@notucla.edu", False),
        ("joebruin@berkeley.edu", False),
        
        # Invalid email syntax
        ("joebruin_at_ucla.edu", False),
        ("@ucla.edu", False),
        ("joebruin@", False),
        ("joebruin@ucla..edu", False),
        ("joebruin@.ucla.edu", False),
        ("joe bruin@ucla.edu", False),
    ]

    passed_count = 0
    total_count = len(test_cases)

    print("Running UCLA Email Validation Tests...\n" + "="*65)
    for email, expected in test_cases:
        result = validate_ucla_email(email)
        status = "PASS" if result == expected else "FAIL"
        if status == "PASS":
            passed_count += 1
        print(f"[{status}] Email: {email:<30} | Expected: {str(expected):<5} | Got: {str(result):<5}")

    print("="*65)
    print(f"Summary: {passed_count}/{total_count} tests passed.")
    return passed_count == total_count

if __name__ == '__main__':
    success = run_tests()
    sys.exit(0 if success else 1)
