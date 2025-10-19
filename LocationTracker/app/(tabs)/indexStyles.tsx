import {
  StyleSheet
} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  surface: {
    elevation: 12,
    borderRadius: 20,
    shadowColor: '#0f172a',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    backgroundColor: '#ffffff',
    padding: 36,
    width: '92%',
    maxWidth: 440,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  backgroundImage: {
    flex: 1,
  },
  backgroundImageStyle: {
    opacity: 0.05,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 36,
  },
  input: {
    marginBottom: 24,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    elevation: 2,
    shadowColor: '#64748b',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    height: 56,
    minHeight: 56,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  button: {
    marginTop: 28,
    borderRadius: 14,
    elevation: 6,
    shadowColor: '#0f172a',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    height: 56,
    backgroundColor: '#0ea5e9',
  },
  errorText: {
    color: '#dc2626',
    fontWeight: '600',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
  }
});